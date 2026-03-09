import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { StockReservation } from '../inventory/entities/stock-reservation.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { LoyaltyTransaction } from '../loyalty/entities/loyalty-transaction.entity';
import { LoyaltyPoints } from '../loyalty/entities/loyalty-points.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ReservationStatus } from '@common/enums';
import { LoyaltyTransactionType } from '@common/enums';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(StockReservation)
    private reservationRepository: Repository<StockReservation>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(LoyaltyTransaction)
    private loyaltyTxRepository: Repository<LoyaltyTransaction>,
    @InjectRepository(LoyaltyPoints)
    private loyaltyPointsRepository: Repository<LoyaltyPoints>,
    private subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Release expired stock reservations every 5 minutes.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredReservations() {
    const now = new Date();
    const expired = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.HELD,
        expiresAt: LessThanOrEqual(now),
      },
    });

    if (expired.length === 0) return;

    this.logger.log(`Releasing ${expired.length} expired reservation(s)`);

    for (const reservation of expired) {
      const inventory = await this.inventoryRepository.findOne({
        where: { id: reservation.inventoryId },
      });
      if (inventory) {
        inventory.quantityReserved -= reservation.quantity;
        inventory.quantityAvailable += reservation.quantity;
        await this.inventoryRepository.save(inventory);
      }
      reservation.status = ReservationStatus.EXPIRED;
      await this.reservationRepository.save(reservation);
    }

    this.logger.log(`Released ${expired.length} expired reservation(s)`);
  }

  /**
   * Process due subscription renewals daily at midnight.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionRenewals() {
    this.logger.log('Checking for due subscription renewals…');
    const { data: due } = await this.subscriptionsService.getDueSubscriptions();
    if (!due || due.length === 0) {
      this.logger.log('No subscriptions due for renewal');
      return;
    }

    this.logger.log(`Processing ${due.length} subscription renewal(s)`);
    for (const sub of due) {
      await this.subscriptionsService.processRenewal(sub.id);
    }
    this.logger.log(`Processed ${due.length} subscription renewal(s)`);
  }

  /**
   * Expire loyalty points daily at 1 AM.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleLoyaltyPointsExpiry() {
    const now = new Date();
    const expiredTxs = await this.loyaltyTxRepository.find({
      where: {
        type: LoyaltyTransactionType.EARNED,
        expiresAt: LessThanOrEqual(now),
      },
    });

    if (expiredTxs.length === 0) return;

    this.logger.log(`Expiring points from ${expiredTxs.length} transaction(s)`);

    // Group by userId
    const byUser = new Map<string, number>();
    for (const tx of expiredTxs) {
      byUser.set(tx.userId, (byUser.get(tx.userId) ?? 0) + tx.points);
      // Mark transaction as expired by nullifying expiresAt
      tx.expiresAt = null;
      tx.type = LoyaltyTransactionType.EXPIRED;
      await this.loyaltyTxRepository.save(tx);
    }

    // Update aggregate points records
    for (const [userId, expiredPoints] of byUser) {
      const points = await this.loyaltyPointsRepository.findOne({
        where: { userId },
      });
      if (points) {
        points.totalExpired += expiredPoints;
        points.availableBalance = Math.max(
          0,
          points.availableBalance - expiredPoints,
        );
        await this.loyaltyPointsRepository.save(points);
      }
    }

    this.logger.log(`Expired points for ${byUser.size} user(s)`);
  }
}
