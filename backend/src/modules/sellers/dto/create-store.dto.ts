import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiPropertyOptional({
    example: 'TechStore Official',
    description: 'Store name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    example: 'techstore-official',
    description: 'URL-friendly slug (unique)',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({
    example: 'Best tech gadgets store',
    description: 'Store description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Store logo URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner.jpg',
    description: 'Store banner URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  bannerUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the store is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
