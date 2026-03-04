import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellersService } from './sellers.service';
import { SellersController, StoresController } from './sellers.controller';
import { Seller } from './entities/seller.entity';
import { Store } from './entities/store.entity';
import { SellerDocument } from './entities/seller-document.entity';
import { SellerWallet } from './entities/seller-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { SellerViolation } from './entities/seller-violation.entity';
import { StoreFollower } from './entities/store-follower.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Seller,
      Store,
      SellerDocument,
      SellerWallet,
      WalletTransaction,
      SellerViolation,
      StoreFollower,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [SellersController, StoresController],
  providers: [SellersService],
  exports: [SellersService, TypeOrmModule],
})
export class SellersModule {}
