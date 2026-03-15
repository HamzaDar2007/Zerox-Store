import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSearchQueryDto {
  @ApiProperty({
    example: 'wireless headphones',
    description: 'Search query text',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query: string;

  @ApiPropertyOptional({
    example: 'sess_abc123',
    description: 'Session ID',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sessionId?: string;

  @ApiPropertyOptional({
    example: 15,
    description: 'Number of results returned',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  resultCount?: number;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Clicked product UUID',
  })
  @IsOptional()
  @IsUUID()
  clickedProduct?: string;
}
