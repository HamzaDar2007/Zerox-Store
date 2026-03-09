import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ShippingRateType } from '@common/enums';

export class CreateShippingRateDto {
  @ApiProperty({ description: 'Shipping method ID' })
  @IsNotEmpty()
  @IsUuidString()
  shippingMethodId: string;

  @ApiProperty({ description: 'Shipping zone ID' })
  @IsNotEmpty()
  @IsUuidString()
  shippingZoneId: string;

  @ApiPropertyOptional({
    description: 'Rate type',
    enum: ShippingRateType,
    default: ShippingRateType.FLAT,
  })
  @IsOptional()
  @IsEnum(ShippingRateType)
  rateType?: ShippingRateType;

  @ApiProperty({ description: 'Base shipping rate' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseRate: number;

  @ApiPropertyOptional({ description: 'Per kilogram rate' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  perKgRate?: number;

  @ApiPropertyOptional({ description: 'Per item rate' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  perItemRate?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount for this rate' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum order amount for this rate' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Free shipping threshold' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  freeShippingThreshold?: number;
}
