import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsBoolean,
  MaxLength,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Store UUID',
  })
  @IsUUID()
  storeId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Category UUID',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Brand UUID',
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({
    example: 'Wireless Bluetooth Headphones',
    description: 'Product name',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  name?: string;

  @ApiProperty({
    example: 'wireless-bluetooth-headphones',
    description: 'URL-friendly slug (unique)',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  slug: string;

  @ApiPropertyOptional({
    example: 'Premium wireless headphones with ANC',
    description: 'Short description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  shortDesc?: string;

  @ApiPropertyOptional({
    example: 'Full product description with features...',
    description: 'Full description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  fullDesc?: string;

  @ApiProperty({ example: 4999.99, description: 'Base price' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({
    example: 'PKR',
    description: 'Currency code (ISO 3-letter)',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is a digital product',
  })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product requires shipping',
  })
  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @ApiPropertyOptional({
    example: 'standard',
    description: 'Tax class',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxClass?: string;

  @ApiPropertyOptional({
    example: 'draft',
    description: 'Product status (e.g. draft, active, archived)',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;
}
