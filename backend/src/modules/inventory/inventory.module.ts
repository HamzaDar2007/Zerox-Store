import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import {
  WarehousesController,
  InventoryController,
  InventoryTransfersController,
} from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { Warehouse } from './entities/warehouse.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockReservation } from './entities/stock-reservation.entity';
import { InventoryTransfer } from './entities/inventory-transfer.entity';
import { InventoryTransferItem } from './entities/inventory-transfer-item.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      Warehouse,
      StockMovement,
      StockReservation,
      InventoryTransfer,
      InventoryTransferItem,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [
    WarehousesController,
    InventoryController,
    InventoryTransfersController,
  ],
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule {}
