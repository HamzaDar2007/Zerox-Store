import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsArray,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, WarrantyType } from '@common/enums';

export class CreateProductDto {
  @ApiProperty({ description: 'Seller ID' })
  @IsUuidString()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUuidString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsUuidString()
  brandId?: string;

  @ApiProperty({ description: 'Product name', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: 'Product slug (auto-generated if not provided)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ description: 'Full product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Short description for listing',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({ description: 'Product price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Compare at price (original price for discounts)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ description: 'Cost price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'PKR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'Stock quantity', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Low stock alert threshold', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'SKU', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ description: 'Barcode', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({ description: 'Weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Weight unit', default: 'kg' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  weightUnit?: string;

  @ApiPropertyOptional({ description: 'Length' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({ description: 'Width' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ description: 'Height' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ description: 'Dimension unit', default: 'cm' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dimensionUnit?: string;

  @ApiPropertyOptional({ enum: WarrantyType })
  @IsOptional()
  @IsEnum(WarrantyType)
  warrantyType?: WarrantyType;

  @ApiPropertyOptional({ description: 'Warranty duration in months' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  warrantyDurationMonths?: number;

  @ApiPropertyOptional({ description: 'Product tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Is featured product', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Is digital product', default: false })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiPropertyOptional({ description: 'Requires shipping', default: true })
  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @ApiPropertyOptional({ description: 'Is taxable', default: true })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({ description: 'Meta title for SEO' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta description for SEO' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;
}
