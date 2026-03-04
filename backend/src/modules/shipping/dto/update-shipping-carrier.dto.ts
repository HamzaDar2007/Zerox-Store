import { PartialType } from '@nestjs/swagger';
import { CreateShippingCarrierDto } from './create-shipping-carrier.dto';

export class UpdateShippingCarrierDto extends PartialType(CreateShippingCarrierDto) {}
