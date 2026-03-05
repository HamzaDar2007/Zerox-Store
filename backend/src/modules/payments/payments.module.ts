import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import {
  PaymentsController,
  RefundsController,
  PaymentMethodsController,
} from './payments.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { Payment } from './entities/payment.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { Refund } from './entities/refund.entity';
import { SavedPaymentMethod } from './entities/saved-payment-method.entity';
import { StripeService } from './providers/stripe.service';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Payment,
      PaymentAttempt,
      Refund,
      SavedPaymentMethod,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [PaymentsController, RefundsController, PaymentMethodsController, StripeWebhookController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService, StripeService, TypeOrmModule],
})
export class PaymentsModule {}
