import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ description: 'URL-friendly slug', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  slug: string;

  @ApiProperty({ description: 'Page title', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Page content (HTML or Markdown)' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Short excerpt', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ description: 'SEO meta title', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Parent page ID for hierarchy' })
  @IsOptional()
  @IsUuidString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the page is published', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
