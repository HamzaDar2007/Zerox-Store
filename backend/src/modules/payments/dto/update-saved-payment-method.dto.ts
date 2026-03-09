import { PartialType } from '@nestjs/swagger';
import { CreateSavedPaymentMethodDto } from './create-saved-payment-method.dto';

export class UpdateSavedPaymentMethodDto extends PartialType(
  CreateSavedPaymentMethodDto,
) {}
