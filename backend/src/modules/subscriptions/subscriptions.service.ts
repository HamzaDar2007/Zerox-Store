import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription } from './entities/subscription.entity';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
  ) {}

  async createPlan(dto: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const plan = this.planRepo.create(dto);
    return this.planRepo.save(plan);
  }

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({ order: { price: 'ASC' } });
  }

  async findPlan(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async updatePlan(
    id: string,
    dto: Partial<SubscriptionPlan>,
  ): Promise<SubscriptionPlan> {
    const plan = await this.findPlan(id);
    Object.assign(plan, dto);
    return this.planRepo.save(plan);
  }

  async removePlan(id: string): Promise<void> {
    const plan = await this.findPlan(id);
    await this.planRepo.remove(plan);
  }

  async subscribe(dto: Partial<Subscription>): Promise<Subscription> {
    dto.status = dto.status || 'active';
    const sub = this.subRepo.create(dto);
    const saved = await this.subRepo.save(sub);

    if (dto.userId && dto.planId) {
      const plan = await this.planRepo.findOne({
        where: { id: dto.planId as string },
      });
      this.notificationHelper
        .notify(dto.userId as string, 'SUBSCRIPTION_CREATED', {
          planName: plan?.name || 'plan',
        })
        .catch(() => {});
    }

    return saved;
  }

  async findSubscription(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<Subscription> {
    const sub = await this.subRepo.findOne({
      where: { id },
      relations: ['user', 'plan'],
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, sub.userId);
    return sub;
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.subRepo.find({ where: { userId }, relations: ['plan'] });
  }

  async findByGatewaySubId(gatewaySubId: string): Promise<Subscription | null> {
    return this.subRepo.findOne({
      where: { gatewaySubId },
      relations: ['user', 'plan'],
    });
  }

  async updateSubscription(
    id: string,
    dto: Partial<Subscription>,
  ): Promise<Subscription> {
    const sub = await this.findSubscription(id);
    Object.assign(sub, dto);
    return this.subRepo.save(sub);
  }

  async cancelSubscription(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<Subscription> {
    const sub = await this.findSubscription(id, callerId, callerRole);
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    const saved = await this.subRepo.save(sub);

    if (sub.userId) {
      const plan =
        sub.plan ||
        (sub.planId
          ? await this.planRepo.findOne({ where: { id: sub.planId } })
          : null);
      this.notificationHelper
        .notify(sub.userId, 'SUBSCRIPTION_CANCELLED', {
          planName: plan?.name || 'plan',
        })
        .catch(() => {});
      // Send cancellation email
      if (sub.user?.email) {
        this.mailService
          .sendSubscriptionCancelledEmail(
            sub.user.email,
            sub.user.firstName || 'Customer',
            plan?.name || 'plan',
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  async findDueForRenewal(): Promise<Subscription[]> {
    return this.subRepo
      .createQueryBuilder('s')
      .where('s.status = :status', { status: 'active' })
      .andWhere('s.currentPeriodEnd <= :now', { now: new Date() })
      .getMany();
  }
}
