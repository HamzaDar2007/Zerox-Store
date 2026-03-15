import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product UUID',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 'SKU-BT-HP-001',
    description: 'Stock keeping unit',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  sku: string;

  @ApiPropertyOptional({
    example: 5499.99,
    description: 'Variant price (overrides base price)',
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 250, description: 'Weight in grams' })
  @IsOptional()
  @IsInt()
  weightGrams?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the variant is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
