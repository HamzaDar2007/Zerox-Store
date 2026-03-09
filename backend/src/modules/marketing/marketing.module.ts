import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingService } from './marketing.service';
import {
  CampaignsController,
  FlashSalesController,
  VouchersController,
} from './marketing.controller';
import { Campaign } from './entities/campaign.entity';
import { CampaignProduct } from './entities/campaign-product.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { FlashSaleProduct } from './entities/flash-sale-product.entity';
import { Voucher } from './entities/voucher.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';
import { VoucherCondition } from './entities/voucher-condition.entity';
import { VoucherProduct } from './entities/voucher-product.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      CampaignProduct,
      FlashSale,
      FlashSaleProduct,
      Voucher,
      VoucherUsage,
      VoucherCondition,
      VoucherProduct,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [CampaignsController, FlashSalesController, VouchersController],
  providers: [MarketingService],
  exports: [MarketingService, TypeOrmModule],
})
export class MarketingModule {}
