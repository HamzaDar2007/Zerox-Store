import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadProductImageDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Alt text for the image' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Sort order (as string from multipart)' })
  @IsOptional()
  @IsString()
  sortOrder?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary image (as string from multipart)',
  })
  @IsOptional()
  @IsString()
  isPrimary?: string;
}

export class UploadProductImagesDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  productId: string;
}
