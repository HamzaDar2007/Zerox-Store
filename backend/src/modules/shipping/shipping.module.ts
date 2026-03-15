import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingZoneCountry } from './entities/shipping-zone-country.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { Shipment } from './entities/shipment.entity';
import { ShipmentEvent } from './entities/shipment-event.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShippingZone,
      ShippingZoneCountry,
      ShippingMethod,
      Shipment,
      ShipmentEvent,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService, TypeOrmModule],
})
export class ShippingModule {}
