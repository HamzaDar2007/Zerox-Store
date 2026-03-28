import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeValueDto {
  @ApiProperty({ example: 'Red', description: 'Attribute value' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  value: string;

  @ApiPropertyOptional({
    example: '#FF0000',
    description: 'Display value (e.g. hex color)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayValue?: string;

  @ApiPropertyOptional({ example: 0, description: 'Sort order' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
