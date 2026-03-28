import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  UseGuards,
  Get,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateSubscriptionSessionDto } from './dto/create-subscription-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { SafeLogger } from '../../common/utils/logger.util';
import { Public } from '../../common/decorators/public.decorator';
import { DataSource } from 'typeorm';

@ApiTags('Stripe')
@Controller('stripe')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationHelper: NotificationHelperService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a Stripe Checkout Session for an order' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  async createCheckout(@Body() body: CreateCheckoutDto, @Req() req: any) {
    // Verify order exists and belongs to caller
    const order = await this.ordersService.findOne(
      body.orderId,
      req.user.id,
      req.user.role,
    );
    const amount = Number(order.totalAmount);
    const session = await this.stripeService.createCheckoutSession({
      orderId: body.orderId,
      amount,
      customerEmail: req.user.email,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      metadata: { userId: req.user.id },
    });
    return { sessionId: session.id, url: session.url };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a Stripe Checkout Session for a subscription',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription checkout session created',
  })
  async createSubscription(
    @Body() body: CreateSubscriptionSessionDto,
    @Req() req: any,
  ) {
    const session = await this.stripeService.createSubscriptionSession({
      priceId: body.priceId,
      customerEmail: req.user.email,
      userId: req.user.id,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return { sessionId: session.id, url: session.url };
  }

  @Get('prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get configured subscription price IDs' })
  @ApiResponse({ status: 200, description: 'Price IDs returned' })
  getPrices() {
    return this.stripeService.getPriceIds();
  }

  @Post('webhook')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody || req.body,
      signature,
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;
        const gatewayTxId = session.payment_intent || session.id;

        if (orderId) {
          // Idempotency: Check if payment already recorded for this transaction
          const existingPayments = await this.paymentsService.findAll({
            orderId,
          });
          const alreadyProcessed = existingPayments.some(
            (p) => p.gatewayTxId === gatewayTxId,
          );
          if (alreadyProcessed) {
            SafeLogger.log(
              `Duplicate webhook for txn ${gatewayTxId}, skipping`,
              'StripeWebhook',
            );
            break;
          }

          // Atomic: create payment + update order in a single transaction
          await this.dataSource.transaction(async (manager) => {
            await manager.query(
              `INSERT INTO payments (order_id, user_id, gateway, gateway_tx_id, amount, currency, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                orderId,
                userId || null,
                'stripe',
                gatewayTxId,
                (session.amount_total || 0) / 100,
                session.currency || 'pkr',
                'paid',
              ],
            );
            await manager.query(`UPDATE orders SET status = $1 WHERE id = $2`, [
              'confirmed',
              orderId,
            ]);
          });

          if (userId) {
            this.notificationHelper
              .notify(userId, 'PAYMENT_RECEIVED', {
                orderId,
                amount: String((session.amount_total || 0) / 100),
                currency: session.currency || 'PKR',
              })
              .catch(() => {});
          }
        }

        SafeLogger.log(`Checkout completed: ${session.id}`, 'StripeWebhook');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subId = invoice.subscription;
        if (subId) {
          // Find subscription by gateway ID and update period
          const subs =
            await this.subscriptionsService.findByGatewaySubId(subId);
          if (subs) {
            const periodEnd = invoice.lines?.data?.[0]?.period?.end;
            const periodStart = invoice.lines?.data?.[0]?.period?.start;
            await this.subscriptionsService.updateSubscription(subs.id, {
              status: 'active',
              currentPeriodStart: periodStart
                ? new Date(periodStart * 1000)
                : subs.currentPeriodStart,
              currentPeriodEnd: periodEnd
                ? new Date(periodEnd * 1000)
                : subs.currentPeriodEnd,
            });
            if (subs.userId) {
              this.notificationHelper
                .notify(subs.userId, 'SUBSCRIPTION_RENEWAL', {
                  planName: subs.plan?.name || 'plan',
                })
                .catch(() => {});
            }
          }
        }
        SafeLogger.log(`Invoice paid: ${invoice.id}`, 'StripeWebhook');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subId = invoice.subscription;
        if (subId) {
          const subs =
            await this.subscriptionsService.findByGatewaySubId(subId);
          if (subs) {
            await this.subscriptionsService.updateSubscription(subs.id, {
              status: 'past_due',
            });
            if (subs.userId) {
              this.notificationHelper
                .notify(subs.userId, 'PAYMENT_FAILED', {
                  orderId: '',
                  amount: String(invoice.amount_due / 100),
                  currency: invoice.currency || 'PKR',
                })
                .catch(() => {});
            }
          }
        }
        SafeLogger.log(
          `Invoice payment failed: ${invoice.id}`,
          'StripeWebhook',
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const subs = await this.subscriptionsService.findByGatewaySubId(sub.id);
        if (subs) {
          await this.subscriptionsService.updateSubscription(subs.id, {
            status: 'cancelled',
            cancelledAt: new Date(),
          });
          if (subs.userId) {
            this.notificationHelper
              .notify(subs.userId, 'SUBSCRIPTION_CANCELLED', {
                planName: subs.plan?.name || 'plan',
              })
              .catch(() => {});
          }
        }
        SafeLogger.log(`Subscription cancelled: ${sub.id}`, 'StripeWebhook');
        break;
      }

      default:
        SafeLogger.log(
          `Unhandled Stripe event: ${event.type}`,
          'StripeWebhook',
        );
    }

    return { received: true };
  }
}
