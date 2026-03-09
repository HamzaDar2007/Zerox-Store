import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnsService } from './returns.service';
import {
  ReturnsController,
  ReturnReasonsController,
} from './returns.controller';
import { ReturnRequest } from './entities/return-request.entity';
import { ReturnReason } from './entities/return-reason.entity';
import { ReturnImage } from './entities/return-image.entity';
import { ReturnShipment } from './entities/return-shipment.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReturnRequest,
      ReturnReason,
      ReturnImage,
      ReturnShipment,
    ]),
    SharedModule,
    GuardsModule,
    PaymentsModule,
  ],
  controllers: [ReturnsController, ReturnReasonsController],
  providers: [ReturnsService],
  exports: [ReturnsService, TypeOrmModule],
})
export class ReturnsModule {}
