import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyPoints } from './entities/loyalty-points.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import { LoyaltyTransaction } from './entities/loyalty-transaction.entity';
import { ReferralCode } from './entities/referral-code.entity';
import { Referral } from './entities/referral.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyPoints, LoyaltyTier, LoyaltyTransaction, ReferralCode, Referral]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService, TypeOrmModule],
})
export class LoyaltyModule {}
