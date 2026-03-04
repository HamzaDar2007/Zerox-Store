import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController, ShipmentsController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderSnapshot } from './entities/order-snapshot.entity';
import { Shipment } from './entities/shipment.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderStatusHistory,
      OrderSnapshot,
      Shipment,
      ShipmentItem,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [OrdersController, ShipmentsController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
