import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionOrder } from './entities/subscription-order.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { SubscriptionStatus, SubscriptionFrequency } from '@common/enums';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionOrder)
    private orderRepository: Repository<SubscriptionOrder>,
    private readonly mailService: MailService,
  ) {}

  async create(userId: string, dto: CreateSubscriptionDto): Promise<ServiceResponse<Subscription>> {
    const subscription = new Subscription();
    Object.assign(subscription, dto);
    subscription.userId = userId;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.nextDeliveryDate = this.calculateNextDeliveryDate(dto.frequency || SubscriptionFrequency.MONTHLY);
    const saved = await this.subscriptionRepository.save(subscription);

    // Send subscription created email (fire-and-forget)
    this.sendSubscriptionEmail(saved, 'created').catch(() => {});

    return { success: true, message: 'Subscription created', data: saved };
  }

  async findAll(options?: { userId?: string; status?: string; page?: number; limit?: number }): Promise<ServiceResponse<Subscription[]>> {
    const query = this.subscriptionRepository.createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.product', 'product')
      .orderBy('subscription.createdAt', 'DESC');
    if (options?.userId) query.andWhere('subscription.userId = :userId', { userId: options.userId });
    if (options?.status) query.andWhere('subscription.status = :status', { status: options.status });
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    const [subscriptions, total] = await query.getManyAndCount();
    return { success: true, message: 'Subscriptions retrieved', data: subscriptions, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<ServiceResponse<Subscription>> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id }, relations: ['product', 'subscriptionOrders'] });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return { success: true, message: 'Subscription retrieved', data: subscription };
  }

  async findByUser(userId: string): Promise<ServiceResponse<Subscription[]>> {
    const subscriptions = await this.subscriptionRepository.find({ where: { userId }, relations: ['product'] });
    return { success: true, message: 'Subscriptions retrieved', data: subscriptions };
  }

  async update(id: string, dto: UpdateSubscriptionDto): Promise<ServiceResponse<Subscription>> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    Object.assign(subscription, dto);
    const updated = await this.subscriptionRepository.save(subscription);
    return { success: true, message: 'Subscription updated', data: updated };
  }

  async cancel(id: string, reason?: string): Promise<ServiceResponse<Subscription>> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || null;
    const updated = await this.subscriptionRepository.save(subscription);

    // Send subscription cancelled email (fire-and-forget)
    this.sendSubscriptionEmail(updated, 'cancelled').catch(() => {});

    return { success: true, message: 'Subscription cancelled', data: updated };
  }

  async pause(id: string): Promise<ServiceResponse<Subscription>> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.status !== SubscriptionStatus.ACTIVE) throw new BadRequestException('Can only pause active subscriptions');
    subscription.status = SubscriptionStatus.PAUSED;
    subscription.pausedAt = new Date();
    const updated = await this.subscriptionRepository.save(subscription);

    // Send subscription paused email (fire-and-forget)
    this.sendSubscriptionEmail(updated, 'paused').catch(() => {});

    return { success: true, message: 'Subscription paused', data: updated };
  }

  async resume(id: string): Promise<ServiceResponse<Subscription>> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.status !== SubscriptionStatus.PAUSED) throw new BadRequestException('Only paused subscriptions can be resumed');
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.pausedAt = null;
    subscription.nextDeliveryDate = this.calculateNextDeliveryDate(subscription.frequency);
    const updated = await this.subscriptionRepository.save(subscription);

    // Send subscription resumed email (fire-and-forget)
    this.sendSubscriptionEmail(updated, 'resumed').catch(() => {});

    return { success: true, message: 'Subscription resumed', data: updated };
  }

  async createOrder(subscriptionId: string, dto: Partial<SubscriptionOrder>): Promise<ServiceResponse<SubscriptionOrder>> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    const order = new SubscriptionOrder();
    Object.assign(order, dto);
    order.subscriptionId = subscriptionId;
    const saved = await this.orderRepository.save(order);
    return { success: true, message: 'Subscription order created', data: saved };
  }

  async getOrders(subscriptionId: string): Promise<ServiceResponse<SubscriptionOrder[]>> {
    const orders = await this.orderRepository.find({ where: { subscriptionId }, order: { createdAt: 'DESC' } });
    return { success: true, message: 'Orders retrieved', data: orders };
  }

  async getDueSubscriptions(): Promise<ServiceResponse<Subscription[]>> {
    const dueSubscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE, nextDeliveryDate: LessThanOrEqual(new Date()) },
      relations: ['user', 'product'],
    });
    return { success: true, message: 'Due subscriptions retrieved', data: dueSubscriptions };
  }

  async processRenewal(id: string): Promise<ServiceResponse<Subscription>> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    subscription.lastOrderDate = new Date();
    subscription.nextDeliveryDate = this.calculateNextDeliveryDate(subscription.frequency);
    subscription.totalOrders = (subscription.totalOrders || 0) + 1;
    const updated = await this.subscriptionRepository.save(subscription);

    // Send subscription renewal email (fire-and-forget)
    this.sendSubscriptionEmail(updated, 'renewed').catch(() => {});

    return { success: true, message: 'Subscription renewed', data: updated };
  }

  private calculateNextDeliveryDate(frequency: SubscriptionFrequency): Date {
    const next = new Date();
    switch (frequency) {
      case SubscriptionFrequency.WEEKLY: next.setDate(next.getDate() + 7); break;
      case SubscriptionFrequency.BIWEEKLY: next.setDate(next.getDate() + 14); break;
      case SubscriptionFrequency.MONTHLY: next.setMonth(next.getMonth() + 1); break;
      case SubscriptionFrequency.BIMONTHLY: next.setMonth(next.getMonth() + 2); break;
      case SubscriptionFrequency.QUARTERLY: next.setMonth(next.getMonth() + 3); break;
      default: next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  private async sendSubscriptionEmail(subscription: Subscription, action: string): Promise<void> {
    try {
      const full = await this.subscriptionRepository.findOne({
        where: { id: subscription.id },
        relations: ['user', 'product'],
      });
      if (!full?.user?.email) return;
      const name = full.user.name || 'Customer';
      const productName = full.product?.name || 'Product';
      const nextDate = full.nextDeliveryDate ? new Date(full.nextDeliveryDate).toLocaleDateString() : 'TBD';

      switch (action) {
        case 'created':
          await this.mailService.sendSubscriptionCreatedEmail(full.user.email, name, productName, full.frequency);
          break;
        case 'cancelled':
          await this.mailService.sendSubscriptionCancelledEmail(full.user.email, name, productName, full.cancellationReason);
          break;
        case 'paused':
          await this.mailService.sendSubscriptionPausedEmail(full.user.email, name, productName);
          break;
        case 'resumed':
          await this.mailService.sendSubscriptionResumedEmail(full.user.email, name, productName, nextDate);
          break;
        case 'renewed':
          await this.mailService.sendSubscriptionRenewalEmail(full.user.email, name, productName, nextDate);
          break;
      }
    } catch (_) { /* silently ignore */ }
  }
}
