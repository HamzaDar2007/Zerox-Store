import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { InventoryModule } from '../inventory/inventory.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    InventoryModule,
    SubscriptionsModule,
    LoyaltyModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
