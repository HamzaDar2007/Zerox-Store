import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUuidString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  @IsOptional()
  @IsUuidString()
  variantId?: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ description: 'Alt text', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;

  @ApiPropertyOptional({ description: 'Is primary image', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
