import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsObject,
} from 'class-validator';

export class CreateSearchHistoryDto {
  @ApiPropertyOptional({ description: 'User ID (for logged in users)' })
  @IsOptional()
  @IsUuidString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Session ID (for anonymous users)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionId?: string;

  @ApiProperty({ description: 'Search query' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  searchQuery: string;

  @ApiPropertyOptional({ description: 'Number of results', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  resultsCount?: number;

  @ApiPropertyOptional({ description: 'Applied filters' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Product ID that was clicked' })
  @IsOptional()
  @IsUuidString()
  clickedProductId?: string;
}
