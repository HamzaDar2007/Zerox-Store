import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product UUID',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Variant UUID (optional)',
  })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({
    example: 'https://example.com/product-image.jpg',
    description: 'Image URL',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    example: 'Front view of headphones',
    description: 'Alt text for accessibility',
  })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display sort order' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the primary image',
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
