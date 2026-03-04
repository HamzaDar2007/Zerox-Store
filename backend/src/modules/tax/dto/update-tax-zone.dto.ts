import { PartialType } from '@nestjs/swagger';
import { CreateTaxZoneDto } from './create-tax-zone.dto';

export class UpdateTaxZoneDto extends PartialType(CreateTaxZoneDto) {}
