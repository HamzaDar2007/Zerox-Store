import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsBoolean,
  IsDate,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Coupon code',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'percentage',
    description: 'Discount type (percentage or fixed)',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  discountType: string;

  @ApiProperty({ example: 15, description: 'Discount value' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum discount amount',
  })
  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Minimum order value to apply coupon',
  })
  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 100, description: 'Total usage limit' })
  @IsOptional()
  @IsInt()
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1, description: 'Per-user usage limit' })
  @IsOptional()
  @IsInt()
  perUserLimit?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether coupon is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '2024-06-01T00:00:00Z',
    description: 'Coupon start date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional({
    example: '2024-08-31T23:59:59Z',
    description: 'Coupon expiration date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}
