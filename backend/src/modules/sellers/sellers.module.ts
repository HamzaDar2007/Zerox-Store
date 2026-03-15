import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellersService } from './sellers.service';
import { SellersController, StoresController } from './sellers.controller';
import { Seller } from './entities/seller.entity';
import { Store } from './entities/store.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seller, Store]),
    SharedModule,
    GuardsModule,
    NotificationsModule,
  ],
  controllers: [SellersController, StoresController],
  providers: [SellersService],
  exports: [SellersService, TypeOrmModule],
})
export class SellersModule {}
