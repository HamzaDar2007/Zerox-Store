import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateSeoMetadataDto {
  @ApiProperty({
    description: 'Entity type (e.g., product, category, page)',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsUuidString()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Meta title for search engines',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'Meta description for search engines',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Meta keywords', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'Open Graph title', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ogTitle?: string;

  @ApiPropertyOptional({
    description: 'Open Graph description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  ogImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Open Graph type (e.g., website, article)',
    maxLength: 50,
    default: 'website',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ogType?: string;

  @ApiPropertyOptional({ description: 'Twitter card type', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  twitterCardType?: string;

  @ApiPropertyOptional({ description: 'Twitter title', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitterTitle?: string;

  @ApiPropertyOptional({ description: 'Twitter description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  twitterDescription?: string;

  @ApiPropertyOptional({ description: 'Twitter image URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  twitterImageUrl?: string;

  @ApiPropertyOptional({ description: 'JSON-LD structured data', type: Object })
  @IsOptional()
  structuredData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Robots meta directive',
    maxLength: 100,
    default: 'index, follow',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  robotsDirective?: string;
}
