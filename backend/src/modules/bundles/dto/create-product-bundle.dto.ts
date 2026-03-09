import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUrl,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VoucherType } from '@common/enums';

class BundleItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUuidString()
  productId: string;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsOptional()
  @IsUuidString()
  variantId?: string;

  @ApiPropertyOptional({ description: 'Quantity in bundle', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class CreateProductBundleDto {
  @ApiProperty({ description: 'Bundle name', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({ description: 'Bundle description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Bundle image URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({
    description: 'Discount type',
    enum: VoucherType,
    default: VoucherType.PERCENTAGE,
  })
  @IsEnum(VoucherType)
  discountType: VoucherType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0.01)
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Fixed bundle price (overrides calculated price)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bundlePrice?: number;

  @ApiPropertyOptional({ description: 'Bundle start date' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Bundle end date' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({
    description: 'Whether the bundle is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Seller ID (for marketplace bundles)' })
  @IsOptional()
  @IsUuidString()
  sellerId?: string;

  @ApiPropertyOptional({ description: 'Bundle items', type: [BundleItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items?: BundleItemDto[];
}
