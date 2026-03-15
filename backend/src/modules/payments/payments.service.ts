import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(CouponUsage)
    private couponUsageRepo: Repository<CouponUsage>,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
  ) {}

  async create(dto: Partial<Payment>): Promise<Payment> {
    dto.status = dto.status || 'pending';
    // Derive userId from the referenced order if not set
    if (!dto.userId && dto.orderId) {
      const order = await this.paymentRepo.manager.query(
        'SELECT user_id FROM orders WHERE id = $1',
        [dto.orderId],
      );
      if (order?.length) dto.userId = order[0].user_id;
    }
    const payment = this.paymentRepo.create(dto);
    return this.paymentRepo.save(payment);
  }

  async findAll(options?: {
    orderId?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Payment[]> {
    const where: any = {};
    if (options?.orderId) where.orderId = options.orderId;
    if (options?.userId) where.userId = options.userId;
    if (options?.status) where.status = options.status;
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    return this.paymentRepo.find({
      where,
      relations: ['order', 'user'],
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, payment.userId);
    return payment;
  }

  async updateStatus(
    id: string,
    status: string,
    gatewayTxId?: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;
    if (gatewayTxId) payment.gatewayTxId = gatewayTxId;
    const saved = await this.paymentRepo.save(payment);

    if (payment.userId) {
      const templateKey =
        status === 'failed' ? 'PAYMENT_FAILED' : 'PAYMENT_RECEIVED';
      this.notificationHelper
        .notify(payment.userId, templateKey, {
          orderId: payment.orderId || '',
          amount: String(payment.amount ?? ''),
          currency: payment.currency || 'PKR',
        })
        .catch(() => {});
      // Send payment email
      const full = await this.paymentRepo.findOne({
        where: { id },
        relations: ['user'],
      });
      if (full?.user) {
        if (status === 'paid' || status === 'completed') {
          this.mailService
            .sendPaymentSuccess(
              full.user.email,
              full.user.firstName || 'Customer',
              payment.orderId,
              Number(payment.amount ?? 0),
              payment.currency || 'PKR',
              payment.gateway || '',
            )
            .catch(() => {});
        } else if (status === 'failed') {
          this.mailService
            .sendPaymentFailure(
              full.user.email,
              full.user.firstName || 'Customer',
              payment.orderId,
              Number(payment.amount ?? 0),
              payment.currency || 'PKR',
              'Payment declined',
            )
            .catch(() => {});
        }
      }
    }

    return saved;
  }

  async recordCouponUsage(
    couponId: string,
    userId: string,
    orderId?: string,
  ): Promise<CouponUsage> {
    const usage = this.couponUsageRepo.create({ couponId, userId, orderId });
    return this.couponUsageRepo.save(usage);
  }

  async findCouponUsages(couponId: string): Promise<CouponUsage[]> {
    return this.couponUsageRepo.find({
      where: { couponId },
      relations: ['user', 'order'],
    });
  }

  async findCouponUsagesByUser(
    couponId: string,
    userId: string,
  ): Promise<CouponUsage[]> {
    return this.couponUsageRepo.find({ where: { couponId, userId } });
  }

  async findAllPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { orderId },
      relations: ['user'],
    });
  }
}
