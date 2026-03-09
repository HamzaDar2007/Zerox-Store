import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { Refund } from './entities/refund.entity';
import { SavedPaymentMethod } from './entities/saved-payment-method.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
// UpdateRefundDto reserved for future refund update endpoint
import { CreateSavedPaymentMethodDto } from './dto/create-saved-payment-method.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import {
  PaymentStatus,
  RefundStatus,
  PaymentAttemptStatus,
  PaymentMethod,
} from '@common/enums';
import { MailService } from '../../common/modules/mail/mail.service';
import { StripeService } from './providers/stripe.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentAttempt)
    private attemptRepository: Repository<PaymentAttempt>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @InjectRepository(SavedPaymentMethod)
    private savedMethodRepository: Repository<SavedPaymentMethod>,
    private readonly mailService: MailService,
    private readonly stripeService: StripeService,
  ) {}

  // ==================== PAYMENTS ====================

  async createPayment(
    dto: CreatePaymentDto,
  ): Promise<ServiceResponse<Payment>> {
    const payment = new Payment();
    Object.assign(payment, {
      ...dto,
      status: PaymentStatus.PENDING,
    });
    payment.paymentNumber =
      'PAY-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const savedPayment = await this.paymentRepository.save(payment);

    return {
      success: true,
      message: 'Payment created successfully',
      data: savedPayment,
    };
  }

  async findAllPayments(options?: {
    orderId?: string;
    userId?: string;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Payment[]>> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .orderBy('payment.createdAt', 'DESC');

    if (options?.orderId) {
      query.andWhere('payment.orderId = :orderId', {
        orderId: options.orderId,
      });
    }

    if (options?.userId) {
      query.andWhere('payment.userId = :userId', { userId: options.userId });
    }

    if (options?.status) {
      query.andWhere('payment.status = :status', { status: options.status });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [payments, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
      meta: { total, page, limit },
    };
  }

  async findOnePayment(id: string): Promise<ServiceResponse<Payment>> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order', 'attempts'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  }

  async updatePayment(
    id: string,
    dto: UpdatePaymentDto,
  ): Promise<ServiceResponse<Payment>> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    Object.assign(payment, dto);
    const updatedPayment = await this.paymentRepository.save(payment);

    return {
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment,
    };
  }

  async processPayment(
    paymentId: string,
    paymentData: any,
  ): Promise<ServiceResponse<Payment>> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    // Record attempt
    const attempt = new PaymentAttempt();
    Object.assign(attempt, {
      paymentId,
      attemptNumber: 1,
      gatewayRequest: paymentData,
      status: PaymentAttemptStatus.PROCESSING,
    });
    await this.attemptRepository.save(attempt);

    try {
      const isStripe =
        payment.gatewayName === 'stripe' ||
        payment.paymentMethod === PaymentMethod.STRIPE ||
        paymentData?.stripePaymentMethodId;

      if (isStripe) {
        // ===== STRIPE PAYMENT PROCESSING =====
        const amountInSmallestUnit = Math.round(Number(payment.amount) * 100);
        const intent = await this.stripeService.createPaymentIntent({
          amount: amountInSmallestUnit,
          currency: payment.currencyCode || 'pkr',
          customerId: paymentData?.stripeCustomerId,
          paymentMethodId: paymentData?.stripePaymentMethodId,
          metadata: {
            paymentId: payment.id,
            paymentNumber: payment.paymentNumber,
            orderId: payment.orderId || '',
          },
          confirm: !!paymentData?.stripePaymentMethodId,
        });

        payment.gatewayName = 'stripe';
        payment.gatewayTransactionId = intent.id;
        payment.gatewayResponse = intent as any;

        if (intent.status === 'succeeded') {
          payment.status = PaymentStatus.COMPLETED;
          payment.paidAt = new Date();
        } else if (
          intent.status === 'requires_action' ||
          intent.status === 'requires_confirmation'
        ) {
          payment.status = PaymentStatus.AUTHORIZED;
        } else {
          payment.status = PaymentStatus.PENDING;
        }

        attempt.status = PaymentAttemptStatus.SUCCESS;
        attempt.gatewayResponse = intent as any;
        await this.attemptRepository.save(attempt);
      } else {
        // ===== NON-STRIPE (legacy simulation) =====
        payment.status = PaymentStatus.COMPLETED;
        payment.paidAt = new Date();
        payment.gatewayTransactionId = `TXN${Date.now()}`;

        attempt.status = PaymentAttemptStatus.SUCCESS;
        await this.attemptRepository.save(attempt);
      }
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      attempt.status = PaymentAttemptStatus.FAILED;
      attempt.errorMessage = error.message;
      await this.attemptRepository.save(attempt);
    }

    const updatedPayment = await this.paymentRepository.save(payment);

    // Send payment email (fire-and-forget)
    this.sendPaymentEmail(updatedPayment).catch(() => {});

    return {
      success: true,
      message: `Payment ${payment.status.toLowerCase()}`,
      data: updatedPayment,
    };
  }

  /** Fetch user via payment relation and send payment success/failure email */
  private async sendPaymentEmail(payment: Payment): Promise<void> {
    try {
      const fullPayment = await this.paymentRepository.findOne({
        where: { id: payment.id },
        relations: ['order', 'order.user'],
      });
      const user: User | undefined = (fullPayment as any)?.order?.user;
      if (!user?.email) return;
      const amount = Number(fullPayment.amount);
      const currency = fullPayment.currencyCode || 'PKR';
      if (fullPayment.status === PaymentStatus.COMPLETED) {
        await this.mailService.sendPaymentSuccess(
          user.email,
          user.name || 'Customer',
          fullPayment.paymentNumber,
          amount,
          currency,
          fullPayment.paymentMethod || 'N/A',
        );
      } else if (fullPayment.status === PaymentStatus.FAILED) {
        await this.mailService.sendPaymentFailure(
          user.email,
          user.name || 'Customer',
          fullPayment.paymentNumber,
          amount,
          currency,
          fullPayment.failureReason || 'Payment processing failed',
        );
      }
    } catch (err) {
      /* silently ignore */
    }
  }

  async getPaymentAttempts(
    paymentId: string,
  ): Promise<ServiceResponse<PaymentAttempt[]>> {
    const attempts = await this.attemptRepository.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Payment attempts retrieved successfully',
      data: attempts,
    };
  }

  // ==================== REFUNDS ====================

  async createRefund(
    dto: CreateRefundDto,
    _userId: string,
  ): Promise<ServiceResponse<Refund>> {
    const payment = await this.paymentRepository.findOne({
      where: { id: dto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    // Calculate remaining refundable amount
    const existingRefunds = await this.refundRepository.find({
      where: { paymentId: dto.paymentId, status: RefundStatus.COMPLETED },
    });
    const refundedAmount = existingRefunds.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    const remainingAmount = Number(payment.amount) - refundedAmount;

    if (dto.amount > remainingAmount) {
      throw new BadRequestException(
        `Refund amount exceeds remaining refundable amount of ${remainingAmount}`,
      );
    }

    const refund = new Refund();
    Object.assign(refund, {
      ...dto,
      status: RefundStatus.PENDING,
    });
    refund.refundNumber =
      'REF-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const savedRefund = await this.refundRepository.save(refund);

    // Send refund requested email (fire-and-forget)
    this.sendRefundEmail(savedRefund, 'requested', payment).catch(() => {});

    return {
      success: true,
      message: 'Refund request created successfully',
      data: savedRefund,
    };
  }

  async findAllRefunds(options?: {
    paymentId?: string;
    status?: RefundStatus;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Refund[]>> {
    const query = this.refundRepository
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.payment', 'payment')
      .orderBy('refund.createdAt', 'DESC');

    if (options?.paymentId) {
      query.andWhere('refund.paymentId = :paymentId', {
        paymentId: options.paymentId,
      });
    }

    if (options?.status) {
      query.andWhere('refund.status = :status', { status: options.status });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [refunds, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Refunds retrieved successfully',
      data: refunds,
      meta: { total, page, limit },
    };
  }

  async findOneRefund(id: string): Promise<ServiceResponse<Refund>> {
    const refund = await this.refundRepository.findOne({
      where: { id },
      relations: ['payment'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return {
      success: true,
      message: 'Refund retrieved successfully',
      data: refund,
    };
  }

  async processRefund(refundId: string): Promise<ServiceResponse<Refund>> {
    const refund = await this.refundRepository.findOne({
      where: { id: refundId },
      relations: ['payment'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Refund already processed');
    }

    const payment =
      refund.payment ||
      (await this.paymentRepository.findOne({
        where: { id: refund.paymentId },
      }));

    try {
      const isStripe =
        payment?.gatewayName === 'stripe' && payment?.gatewayTransactionId;

      if (isStripe) {
        // ===== STRIPE REFUND PROCESSING =====
        const amountInSmallestUnit = Math.round(Number(refund.amount) * 100);
        const stripeRefund = await this.stripeService.createRefund({
          paymentIntentId: payment.gatewayTransactionId,
          amount: amountInSmallestUnit,
          metadata: {
            refundId: refund.id,
            refundNumber: refund.refundNumber,
          },
        });

        refund.status = RefundStatus.COMPLETED;
        refund.processedAt = new Date();
        refund.gatewayRefundId = stripeRefund.id;
      } else {
        // ===== NON-STRIPE (legacy simulation) =====
        refund.status = RefundStatus.COMPLETED;
        refund.processedAt = new Date();
        refund.gatewayRefundId = `REF${Date.now()}`;
      }
    } catch (error) {
      refund.status = RefundStatus.FAILED;
      refund.reasonDetails = error.message;
      this.logger.error(`Refund processing failed: ${error.message}`);
    }

    const updatedRefund = await this.refundRepository.save(refund);

    // Send refund email (fire-and-forget)
    if (updatedRefund.status === RefundStatus.COMPLETED) {
      this.sendRefundEmail(updatedRefund, 'completed').catch(() => {});
    }

    return {
      success: true,
      message: `Refund ${updatedRefund.status.toLowerCase()}`,
      data: updatedRefund,
    };
  }

  async rejectRefund(
    refundId: string,
    reason: string,
  ): Promise<ServiceResponse<Refund>> {
    const refund = await this.refundRepository.findOne({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = RefundStatus.REJECTED;
    refund.reasonDetails = reason;

    const updatedRefund = await this.refundRepository.save(refund);

    // Send refund rejected email (fire-and-forget)
    this.sendRefundEmail(updatedRefund, 'rejected').catch(() => {});

    return {
      success: true,
      message: 'Refund rejected',
      data: updatedRefund,
    };
  }

  /** Fetch user via refund → payment → order → user and send refund email */
  private async sendRefundEmail(
    refund: Refund,
    type: 'requested' | 'completed' | 'rejected',
    paymentEntity?: Payment,
  ): Promise<void> {
    try {
      const fullRefund = await this.refundRepository.findOne({
        where: { id: refund.id },
        relations: ['payment', 'payment.order', 'payment.order.user'],
      });
      const payment = fullRefund?.payment || paymentEntity;
      const user: User | undefined =
        (payment as any)?.order?.user ||
        (fullRefund as any)?.payment?.order?.user;
      if (!user?.email) return;
      const currency = payment?.currencyCode || 'PKR';
      const amount = Number(refund.amount);
      if (type === 'requested') {
        await this.mailService.sendRefundRequested(
          user.email,
          user.name || 'Customer',
          refund.refundNumber,
          amount,
          currency,
        );
      } else if (type === 'completed') {
        await this.mailService.sendRefundCompleted(
          user.email,
          user.name || 'Customer',
          refund.refundNumber,
          amount,
          currency,
        );
      } else if (type === 'rejected') {
        await this.mailService.sendRefundRejected(
          user.email,
          user.name || 'Customer',
          refund.refundNumber,
          refund.reasonDetails || 'Not specified',
        );
      }
    } catch (err) {
      /* silently ignore */
    }
  }

  // ==================== SAVED PAYMENT METHODS ====================

  async savePaymentMethod(
    userId: string,
    dto: CreateSavedPaymentMethodDto,
  ): Promise<ServiceResponse<SavedPaymentMethod>> {
    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.savedMethodRepository.update({ userId }, { isDefault: false });
    }

    const method = new SavedPaymentMethod();
    Object.assign(method, {
      ...dto,
      userId,
    });

    const savedMethod = await this.savedMethodRepository.save(method);

    return {
      success: true,
      message: 'Payment method saved successfully',
      data: savedMethod,
    };
  }

  async getSavedPaymentMethods(
    userId: string,
  ): Promise<ServiceResponse<SavedPaymentMethod[]>> {
    const methods = await this.savedMethodRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Saved payment methods retrieved successfully',
      data: methods,
    };
  }

  async deleteSavedPaymentMethod(
    id: string,
    userId: string,
  ): Promise<ServiceResponse<void>> {
    const method = await this.savedMethodRepository.findOne({
      where: { id, userId },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    await this.savedMethodRepository.remove(method);

    return {
      success: true,
      message: 'Payment method deleted successfully',
    };
  }

  async setDefaultPaymentMethod(
    id: string,
    userId: string,
  ): Promise<ServiceResponse<SavedPaymentMethod>> {
    const method = await this.savedMethodRepository.findOne({
      where: { id, userId },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    // Unset other defaults
    await this.savedMethodRepository.update({ userId }, { isDefault: false });

    method.isDefault = true;
    const updatedMethod = await this.savedMethodRepository.save(method);

    return {
      success: true,
      message: 'Default payment method updated',
      data: updatedMethod,
    };
  }

  // ==================== STRIPE-SPECIFIC METHODS ====================

  /**
   * Create a Stripe PaymentIntent and return the client secret for frontend confirmation.
   */
  async createStripePaymentIntent(params: {
    paymentId: string;
    stripePaymentMethodId?: string;
    stripeCustomerId?: string;
  }): Promise<
    ServiceResponse<{
      clientSecret: string;
      paymentIntentId: string;
      status: string;
    }>
  > {
    const payment = await this.paymentRepository.findOne({
      where: { id: params.paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const amountInSmallestUnit = Math.round(Number(payment.amount) * 100);
    const intent = await this.stripeService.createPaymentIntent({
      amount: amountInSmallestUnit,
      currency: payment.currencyCode || 'pkr',
      customerId: params.stripeCustomerId,
      paymentMethodId: params.stripePaymentMethodId,
      metadata: {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        orderId: payment.orderId || '',
      },
    });

    // Store the intent reference on the payment
    payment.gatewayName = 'stripe';
    payment.gatewayTransactionId = intent.id;
    payment.gatewayResponse = intent as any;
    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: 'Stripe PaymentIntent created',
      data: {
        clientSecret: intent.client_secret!,
        paymentIntentId: intent.id,
        status: intent.status,
      },
    };
  }

  /**
   * Confirm a Stripe PaymentIntent (server-side).
   */
  async confirmStripePayment(params: {
    paymentId: string;
    stripePaymentMethodId?: string;
  }): Promise<ServiceResponse<Payment>> {
    const payment = await this.paymentRepository.findOne({
      where: { id: params.paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.gatewayTransactionId) {
      throw new BadRequestException(
        'No Stripe PaymentIntent found on this payment',
      );
    }

    const intent = await this.stripeService.confirmPaymentIntent(
      payment.gatewayTransactionId,
      params.stripePaymentMethodId,
    );

    payment.gatewayResponse = intent as any;

    if (intent.status === 'succeeded') {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
    } else if (intent.status === 'requires_action') {
      payment.status = PaymentStatus.AUTHORIZED;
    }

    const updated = await this.paymentRepository.save(payment);

    if (updated.status === PaymentStatus.COMPLETED) {
      this.sendPaymentEmail(updated).catch(() => {});
    }

    return {
      success: true,
      message: `Payment ${updated.status.toLowerCase()}`,
      data: updated,
    };
  }

  /**
   * Handle webhook event from Stripe and update payment status accordingly.
   */
  async handleStripeWebhook(event: any): Promise<void> {
    this.logger.log(`Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const payment = await this.paymentRepository.findOne({
          where: { gatewayTransactionId: intent.id },
        });
        if (payment && payment.status !== PaymentStatus.COMPLETED) {
          payment.status = PaymentStatus.COMPLETED;
          payment.paidAt = new Date();
          payment.gatewayResponse = intent;
          await this.paymentRepository.save(payment);
          this.sendPaymentEmail(payment).catch(() => {});
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const payment = await this.paymentRepository.findOne({
          where: { gatewayTransactionId: intent.id },
        });
        if (payment) {
          payment.status = PaymentStatus.FAILED;
          payment.failureReason =
            intent.last_payment_error?.message || 'Payment failed';
          payment.gatewayResponse = intent;
          await this.paymentRepository.save(payment);
          this.sendPaymentEmail(payment).catch(() => {});
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        // Find refund by gateway refund id
        if (charge.refunds?.data?.length) {
          for (const stripeRefund of charge.refunds.data) {
            const refund = await this.refundRepository.findOne({
              where: { gatewayRefundId: stripeRefund.id },
            });
            if (refund && refund.status !== RefundStatus.COMPLETED) {
              refund.status = RefundStatus.COMPLETED;
              refund.processedAt = new Date();
              await this.refundRepository.save(refund);
              this.sendRefundEmail(refund, 'completed').catch(() => {});
            }
          }
        }
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  /**
   * Save a Stripe payment method by attaching it to a Stripe customer and storing it locally.
   */
  async saveStripePaymentMethod(
    userId: string,
    stripePaymentMethodId: string,
    stripeCustomerId: string,
    setDefault = false,
  ): Promise<ServiceResponse<SavedPaymentMethod>> {
    // Attach the payment method to the Stripe customer
    const stripePm = await this.stripeService.attachPaymentMethod(
      stripePaymentMethodId,
      stripeCustomerId,
    );

    if (setDefault) {
      await this.savedMethodRepository.update({ userId }, { isDefault: false });
    }

    const method = new SavedPaymentMethod();
    method.userId = userId;
    method.paymentMethod = PaymentMethod.STRIPE;
    method.gatewayToken = stripePm.id;
    method.isDefault = setDefault;
    method.nickname = stripePm.card
      ? `${stripePm.card.brand?.toUpperCase()} ****${stripePm.card.last4}`
      : 'Stripe Payment Method';

    if (stripePm.card) {
      method.cardLastFour = stripePm.card.last4 || null;
      method.cardBrand = stripePm.card.brand || null;
      method.cardExpiryMonth = stripePm.card.exp_month || null;
      method.cardExpiryYear = stripePm.card.exp_year || null;
    }

    method.metadata = {
      stripeCustomerId,
      stripePaymentMethodType: stripePm.type,
    };

    const saved = await this.savedMethodRepository.save(method);

    return {
      success: true,
      message: 'Stripe payment method saved',
      data: saved,
    };
  }

  /**
   * Delete a saved payment method – if it's a Stripe method, also detach from Stripe.
   */
  async deletePaymentMethodWithStripe(
    id: string,
    userId: string,
  ): Promise<ServiceResponse<void>> {
    const method = await this.savedMethodRepository.findOne({
      where: { id, userId },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    // If it's a Stripe method with a gateway token, detach from Stripe
    if (method.gatewayToken && method.paymentMethod === PaymentMethod.STRIPE) {
      try {
        await this.stripeService.detachPaymentMethod(method.gatewayToken);
      } catch (err) {
        this.logger.warn(
          `Failed to detach Stripe PM ${method.gatewayToken}: ${err.message}`,
        );
      }
    }

    await this.savedMethodRepository.remove(method);

    return {
      success: true,
      message: 'Payment method deleted successfully',
    };
  }
}
