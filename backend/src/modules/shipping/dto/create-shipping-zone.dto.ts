import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateShippingZoneDto {
  @ApiProperty({ description: 'Shipping zone name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Shipping zone description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Country codes (ISO 2-letter)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({ description: 'State/region codes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  states?: string[];

  @ApiPropertyOptional({ description: 'Postcodes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postcodes?: string[];

  @ApiPropertyOptional({ description: 'Is default shipping zone', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
