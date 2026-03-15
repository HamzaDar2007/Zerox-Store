import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiPropertyOptional({
    example: 'Samsung',
    description: 'Brand name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    example: 'samsung',
    description: 'URL-friendly slug (unique)',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({
    example: 'https://example.com/samsung-logo.png',
    description: 'Brand logo URL',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'https://www.samsung.com',
    description: 'Brand website URL',
  })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the brand is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
