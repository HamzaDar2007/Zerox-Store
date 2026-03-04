import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { VoucherType, VoucherStatus, DiscountType } from '@common/enums';

export class CreateVoucherDto {
  @ApiProperty({ description: 'Voucher code' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Voucher name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Voucher description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Voucher type', enum: VoucherType })
  @IsNotEmpty()
  @IsEnum(VoucherType)
  type: VoucherType;

  @ApiProperty({ description: 'Discount type', enum: DiscountType })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Total usage limit' })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Usage limit per user' })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiPropertyOptional({ description: 'Store ID (for store-specific vouchers)' })
  @IsOptional()
  @IsUuidString()
  storeId?: string;

  @ApiPropertyOptional({ description: 'Voucher status', enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @ApiProperty({ description: 'Start date' })
  @IsNotEmpty()
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'End date' })
  @IsNotEmpty()
  @IsDateString()
  endsAt: string;

  @ApiPropertyOptional({ description: 'Can be combined with other vouchers', default: false })
  @IsOptional()
  @IsBoolean()
  isStackable?: boolean;

  @ApiPropertyOptional({ description: 'Applies to items on sale', default: false })
  @IsOptional()
  @IsBoolean()
  appliesToSaleItems?: boolean;
}
