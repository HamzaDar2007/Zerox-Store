import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import {
  ShippingZonesController,
  ShippingMethodsController,
  ShippingCarriersController,
  ShippingRatesController,
  ShippingCalculatorController,
  DeliverySlotsController,
} from './shipping.controller';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { ShippingCarrier } from './entities/shipping-carrier.entity';
import { ShippingRate } from './entities/shipping-rate.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShippingZone,
      ShippingMethod,
      ShippingCarrier,
      ShippingRate,
      DeliverySlot,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [
    ShippingZonesController,
    ShippingMethodsController,
    ShippingCarriersController,
    ShippingRatesController,
    ShippingCalculatorController,
    DeliverySlotsController,
  ],
  providers: [ShippingService],
  exports: [ShippingService, TypeOrmModule],
})
export class ShippingModule {}
