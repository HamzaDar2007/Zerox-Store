import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import {
  PaymentsController,
  RefundsController,
  PaymentMethodsController,
} from './payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { Refund } from './entities/refund.entity';
import { SavedPaymentMethod } from './entities/saved-payment-method.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentAttempt,
      Refund,
      SavedPaymentMethod,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [PaymentsController, RefundsController, PaymentMethodsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
