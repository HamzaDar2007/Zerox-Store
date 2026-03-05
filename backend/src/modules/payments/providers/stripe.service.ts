import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured – Stripe calls will fail');
    }
    this.stripe = new Stripe(secretKey || '', {
      apiVersion: '2026-02-25.clover',
    });
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  // ==================== PAYMENT INTENTS ====================

  /**
   * Create a PaymentIntent for a given amount (in smallest currency unit, e.g. paisa for PKR).
   */
  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    customerId?: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
    confirm?: boolean;
  }): Promise<Stripe.PaymentIntent> {
    const currency = params.currency || this.configService.get<string>('STRIPE_CURRENCY') || 'pkr';

    try {
      const intentParams: Stripe.PaymentIntentCreateParams = {
        amount: params.amount,
        currency,
        metadata: params.metadata || {},
        automatic_payment_methods: { enabled: true },
      };

      if (params.customerId) {
        intentParams.customer = params.customerId;
      }

      if (params.paymentMethodId) {
        intentParams.payment_method = params.paymentMethodId;
      }

      if (params.confirm) {
        intentParams.confirm = true;
        intentParams.return_url = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      }

      const intent = await this.stripe.paymentIntents.create(intentParams);
      this.logger.log(`PaymentIntent created: ${intent.id}`);
      return intent;
    } catch (error) {
      this.logger.error(`Failed to create PaymentIntent: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Retrieve a PaymentIntent by ID.
   */
  async retrievePaymentIntent(intentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(intentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve PaymentIntent: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Confirm a PaymentIntent (server-side confirmation).
   */
  async confirmPaymentIntent(intentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentConfirmParams = {
        return_url: this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173',
      };
      if (paymentMethodId) {
        params.payment_method = paymentMethodId;
      }
      const intent = await this.stripe.paymentIntents.confirm(intentId, params);
      this.logger.log(`PaymentIntent confirmed: ${intent.id} – status ${intent.status}`);
      return intent;
    } catch (error) {
      this.logger.error(`Failed to confirm PaymentIntent: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Cancel a PaymentIntent.
   */
  async cancelPaymentIntent(intentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.cancel(intentId);
    } catch (error) {
      this.logger.error(`Failed to cancel PaymentIntent: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  // ==================== REFUNDS ====================

  /**
   * Create a refund via Stripe.
   */
  async createRefund(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: Stripe.RefundCreateParams.Reason;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
        metadata: params.metadata || {},
      };

      if (params.amount) {
        refundParams.amount = params.amount;
      }

      if (params.reason) {
        refundParams.reason = params.reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);
      this.logger.log(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new BadRequestException(`Stripe refund error: ${error.message}`);
    }
  }

  // ==================== CUSTOMERS ====================

  /**
   * Create a Stripe Customer.
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: params.metadata || {},
      });
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Retrieve a Stripe Customer by ID.
   */
  async retrieveCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return this.stripe.customers.retrieve(customerId);
  }

  // ==================== PAYMENT METHODS ====================

  /**
   * Attach a PaymentMethod to a Customer.
   */
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      this.logger.error(`Failed to attach payment method: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Detach a PaymentMethod from its Customer.
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      this.logger.error(`Failed to detach payment method: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * List PaymentMethods for a customer.
   */
  async listPaymentMethods(customerId: string, type: Stripe.PaymentMethodListParams.Type = 'card'): Promise<Stripe.PaymentMethod[]> {
    try {
      const result = await this.stripe.paymentMethods.list({
        customer: customerId,
        type,
      });
      return result.data;
    } catch (error) {
      this.logger.error(`Failed to list payment methods: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Retrieve a single PaymentMethod.
   */
  async retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.retrieve(paymentMethodId);
  }

  // ==================== SUBSCRIPTIONS (Stripe Billing) ====================

  /**
   * Create a Stripe Subscription.
   */
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    metadata?: Record<string, string>;
    trialPeriodDays?: number;
  }): Promise<Stripe.Subscription> {
    try {
      const subParams: Stripe.SubscriptionCreateParams = {
        customer: params.customerId,
        items: [{ price: params.priceId }],
        metadata: params.metadata || {},
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      };

      if (params.trialPeriodDays) {
        subParams.trial_period_days = params.trialPeriodDays;
      }

      const subscription = await this.stripe.subscriptions.create(subParams);
      this.logger.log(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw new BadRequestException(`Stripe subscription error: ${error.message}`);
    }
  }

  /**
   * Cancel a Stripe Subscription.
   */
  async cancelSubscription(subscriptionId: string, atPeriodEnd = true): Promise<Stripe.Subscription> {
    try {
      if (atPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Pause a Stripe Subscription (set pause_collection).
   */
  async pauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
        pause_collection: { behavior: 'void' },
      });
    } catch (error) {
      this.logger.error(`Failed to pause subscription: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Resume a paused Stripe Subscription.
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
        pause_collection: '',
      } as any);
    } catch (error) {
      this.logger.error(`Failed to resume subscription: ${error.message}`);
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Retrieve a Stripe Subscription.
   */
  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  // ==================== WEBHOOKS ====================

  /**
   * Construct and verify a webhook event from the raw body and signature header.
   */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }
}
