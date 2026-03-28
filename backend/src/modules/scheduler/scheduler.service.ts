import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private subscriptionsService: SubscriptionsService,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
    private dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processSubscriptionRenewals() {
    // Advisory lock to prevent duplicate processing in multi-instance deployments
    const lockId = 100001;
    const [{ pg_try_advisory_lock: acquired }] = await this.dataSource.query(
      `SELECT pg_try_advisory_lock($1)`,
      [lockId],
    );
    if (!acquired) {
      this.logger.log(
        'Subscription renewal already running on another instance, skipping.',
      );
      return;
    }
    try {
      await this.processRenewals();
    } finally {
      await this.dataSource.query(`SELECT pg_advisory_unlock($1)`, [lockId]);
    }
  }

  private async processRenewals() {
    this.logger.log('Processing subscription renewals...');
    const due = await this.subscriptionsService.findDueForRenewal();
    this.logger.log(`Found ${due.length} subscriptions due for renewal`);
    if (!due.length) return;

    for (const sub of due) {
      try {
        const plan = sub.plan;
        if (!plan) {
          this.logger.warn(
            `Plan not found for subscription ${sub.id}, skipping`,
          );
          continue;
        }

        const newStart = new Date(sub.currentPeriodEnd);
        const newEnd = new Date(newStart);

        const count = plan.intervalCount || 1;
        switch (plan.interval) {
          case 'daily':
            newEnd.setDate(newEnd.getDate() + count);
            break;
          case 'weekly':
            newEnd.setDate(newEnd.getDate() + 7 * count);
            break;
          case 'monthly':
            newEnd.setMonth(newEnd.getMonth() + count);
            break;
          case 'yearly':
            newEnd.setFullYear(newEnd.getFullYear() + count);
            break;
          default:
            newEnd.setMonth(newEnd.getMonth() + count);
        }

        await this.subscriptionsService.updateSubscription(sub.id, {
          currentPeriodStart: newStart,
          currentPeriodEnd: newEnd,
        });

        // Send renewal notification
        this.notificationHelper
          .notify(sub.userId, 'SUBSCRIPTION_RENEWAL', {
            planName: plan.name,
            interval: plan.interval,
          })
          .catch(() => {});

        // Send renewal email
        if (sub.user?.email) {
          this.mailService
            .sendSubscriptionRenewalEmail(
              sub.user.email,
              sub.user.firstName || 'Customer',
              plan.name,
              newEnd.toLocaleDateString(),
            )
            .catch(() => {});
        }

        this.logger.log(
          `Renewed subscription ${sub.id} until ${newEnd.toISOString()}`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to renew subscription ${sub.id}: ${err.message}`,
        );
      }
    }

    this.logger.log('Subscription renewal processing complete');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deactivateExpiredFlashSales() {
    const lockId = 100002;
    const [{ pg_try_advisory_lock: acquired }] = await this.dataSource.query(
      `SELECT pg_try_advisory_lock($1)`,
      [lockId],
    );
    if (!acquired) return;
    try {
      const result = await this.dataSource.query(
        `UPDATE flash_sales SET is_active = false WHERE is_active = true AND end_date < NOW()`,
      );
      if (result[1] > 0) {
        this.logger.log(`Deactivated ${result[1]} expired flash sales`);
      }
    } catch (err) {
      this.logger.error(`Failed to deactivate flash sales: ${err.message}`);
    } finally {
      await this.dataSource.query(`SELECT pg_advisory_unlock($1)`, [lockId]);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cancelStalePendingOrders() {
    const lockId = 100003;
    const [{ pg_try_advisory_lock: acquired }] = await this.dataSource.query(
      `SELECT pg_try_advisory_lock($1)`,
      [lockId],
    );
    if (!acquired) return;
    try {
      const result = await this.dataSource.query(
        `UPDATE orders SET status = 'cancelled' WHERE status = 'pending' AND created_at < NOW() - INTERVAL '48 hours'`,
      );
      if (result[1] > 0) {
        this.logger.log(`Cancelled ${result[1]} stale pending orders`);
      }
    } catch (err) {
      this.logger.error(`Failed to cancel stale orders: ${err.message}`);
    } finally {
      await this.dataSource.query(`SELECT pg_advisory_unlock($1)`, [lockId]);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupGuestCarts() {
    const lockId = 100004;
    const [{ pg_try_advisory_lock: acquired }] = await this.dataSource.query(
      `SELECT pg_try_advisory_lock($1)`,
      [lockId],
    );
    if (!acquired) return;
    try {
      const result = await this.dataSource.query(
        `DELETE FROM carts WHERE user_id IS NULL AND updated_at < NOW() - INTERVAL '30 days'`,
      );
      if (result[1] > 0) {
        this.logger.log(`Cleaned up ${result[1]} stale guest carts`);
      }
    } catch (err) {
      this.logger.error(`Failed to cleanup guest carts: ${err.message}`);
    } finally {
      await this.dataSource.query(`SELECT pg_advisory_unlock($1)`, [lockId]);
    }
  }
}
