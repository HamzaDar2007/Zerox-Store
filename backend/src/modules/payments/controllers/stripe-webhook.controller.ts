import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StripeService } from '../providers/stripe.service';
import { PaymentsService } from '../payments.service';

@ApiTags('Stripe Webhooks')
@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      this.logger.warn('Missing stripe-signature header');
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    try {
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        this.logger.warn('Missing raw body – ensure raw body middleware is configured');
        return res.status(400).json({ error: 'Missing raw body' });
      }

      const event = this.stripeService.constructWebhookEvent(rawBody, signature);

      await this.paymentsService.handleStripeWebhook(event);

      return res.json({ received: true });
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }
}
