import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Applied coupon UUID',
  })
  @IsOptional()
  @IsUUID()
  couponId?: string;

  @ApiPropertyOptional({ example: 200, description: 'Shipping fee' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAmount?: number;

  @ApiPropertyOptional({
    example: '123 Main Street',
    description: 'Shipping address line 1',
  })
  @IsOptional()
  @IsString()
  shippingLine1?: string;

  @ApiPropertyOptional({
    example: 'Apt 4B',
    description: 'Shipping address line 2',
  })
  @IsOptional()
  @IsString()
  shippingLine2?: string;

  @ApiPropertyOptional({
    example: 'Lahore',
    description: 'Shipping city',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCity?: string;

  @ApiPropertyOptional({
    example: 'Punjab',
    description: 'Shipping state',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingState?: string;

  @ApiPropertyOptional({
    example: '54000',
    description: 'Shipping postal code',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  shippingPostalCode?: string;

  @ApiPropertyOptional({ example: 'PK', description: 'Shipping country code' })
  @IsOptional()
  @IsString()
  shippingCountry?: string;
}
