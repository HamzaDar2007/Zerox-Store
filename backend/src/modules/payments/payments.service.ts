import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { UpdateRefundDto } from './dto/update-refund.dto';
import { CreateSavedPaymentMethodDto } from './dto/create-saved-payment-method.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { PaymentStatus, RefundStatus, PaymentAttemptStatus } from '@common/enums';
import { MailService } from '../../common/modules/mail/mail.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
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
  ) {}

  // ==================== PAYMENTS ====================

  async createPayment(dto: CreatePaymentDto): Promise<ServiceResponse<Payment>> {
    const payment = new Payment();
    Object.assign(payment, {
      ...dto,
      status: PaymentStatus.PENDING,
    });
    payment.paymentNumber = 'PAY-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

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
      query.andWhere('payment.orderId = :orderId', { orderId: options.orderId });
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

  async updatePayment(id: string, dto: UpdatePaymentDto): Promise<ServiceResponse<Payment>> {
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

  async processPayment(paymentId: string, paymentData: any): Promise<ServiceResponse<Payment>> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });

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
      // Here you would integrate with actual payment gateway
      // For now, simulate successful payment
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      payment.gatewayTransactionId = `TXN${Date.now()}`;

      attempt.status = PaymentAttemptStatus.SUCCESS;
      await this.attemptRepository.save(attempt);
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
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
        await this.mailService.sendPaymentSuccess(user.email, user.name || 'Customer', fullPayment.paymentNumber, amount, currency, fullPayment.paymentMethod || 'N/A');
      } else if (fullPayment.status === PaymentStatus.FAILED) {
        await this.mailService.sendPaymentFailure(user.email, user.name || 'Customer', fullPayment.paymentNumber, amount, currency, fullPayment.failureReason || 'Payment processing failed');
      }
    } catch (err) { /* silently ignore */ }
  }

  async getPaymentAttempts(paymentId: string): Promise<ServiceResponse<PaymentAttempt[]>> {
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

  async createRefund(dto: CreateRefundDto, userId: string): Promise<ServiceResponse<Refund>> {
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
    const refundedAmount = existingRefunds.reduce((sum, r) => sum + Number(r.amount), 0);
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
    refund.refundNumber = 'REF-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

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
      query.andWhere('refund.paymentId = :paymentId', { paymentId: options.paymentId });
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
    const refund = await this.refundRepository.findOne({ where: { id: refundId } });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Refund already processed');
    }

    // Here you would integrate with payment gateway for actual refund
    refund.status = RefundStatus.COMPLETED;
    refund.processedAt = new Date();
    refund.gatewayRefundId = `REF${Date.now()}`;

    const updatedRefund = await this.refundRepository.save(refund);

    // Send refund completed email (fire-and-forget)
    this.sendRefundEmail(updatedRefund, 'completed').catch(() => {});

    return {
      success: true,
      message: 'Refund processed successfully',
      data: updatedRefund,
    };
  }

  async rejectRefund(refundId: string, reason: string): Promise<ServiceResponse<Refund>> {
    const refund = await this.refundRepository.findOne({ where: { id: refundId } });

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
  private async sendRefundEmail(refund: Refund, type: 'requested' | 'completed' | 'rejected', paymentEntity?: Payment): Promise<void> {
    try {
      const fullRefund = await this.refundRepository.findOne({
        where: { id: refund.id },
        relations: ['payment', 'payment.order', 'payment.order.user'],
      });
      const payment = fullRefund?.payment || paymentEntity;
      const user: User | undefined = (payment as any)?.order?.user || (fullRefund as any)?.payment?.order?.user;
      if (!user?.email) return;
      const currency = payment?.currencyCode || 'PKR';
      const amount = Number(refund.amount);
      if (type === 'requested') {
        await this.mailService.sendRefundRequested(user.email, user.name || 'Customer', refund.refundNumber, amount, currency);
      } else if (type === 'completed') {
        await this.mailService.sendRefundCompleted(user.email, user.name || 'Customer', refund.refundNumber, amount, currency);
      } else if (type === 'rejected') {
        await this.mailService.sendRefundRejected(user.email, user.name || 'Customer', refund.refundNumber, refund.reasonDetails || 'Not specified');
      }
    } catch (err) { /* silently ignore */ }
  }

  // ==================== SAVED PAYMENT METHODS ====================

  async savePaymentMethod(userId: string, dto: CreateSavedPaymentMethodDto): Promise<ServiceResponse<SavedPaymentMethod>> {
    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.savedMethodRepository.update(
        { userId },
        { isDefault: false },
      );
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

  async getSavedPaymentMethods(userId: string): Promise<ServiceResponse<SavedPaymentMethod[]>> {
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

  async deleteSavedPaymentMethod(id: string, userId: string): Promise<ServiceResponse<void>> {
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

  async setDefaultPaymentMethod(id: string, userId: string): Promise<ServiceResponse<SavedPaymentMethod>> {
    const method = await this.savedMethodRepository.findOne({
      where: { id, userId },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    // Unset other defaults
    await this.savedMethodRepository.update(
      { userId },
      { isDefault: false },
    );

    method.isDefault = true;
    const updatedMethod = await this.savedMethodRepository.save(method);

    return {
      success: true,
      message: 'Default payment method updated',
      data: updatedMethod,
    };
  }
}
