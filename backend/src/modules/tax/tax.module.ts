import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxService } from './tax.service';
import {
  TaxZonesController,
  TaxRatesController,
  TaxClassesController,
  TaxCalculatorController,
} from './tax.controller';
import { TaxZone } from './entities/tax-zone.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { TaxClass } from './entities/tax-class.entity';
import { OrderTaxLine } from './entities/order-tax-line.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxZone, TaxRate, TaxClass, OrderTaxLine]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [
    TaxZonesController,
    TaxRatesController,
    TaxClassesController,
    TaxCalculatorController,
  ],
  providers: [TaxService],
  exports: [TaxService, TypeOrmModule],
})
export class TaxModule {}
