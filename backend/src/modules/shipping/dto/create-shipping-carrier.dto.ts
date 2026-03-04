import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateShippingCarrierDto {
  @ApiProperty({ description: 'Carrier name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Carrier code (unique)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: 'Carrier logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Tracking URL template (use {tracking_number} placeholder)' })
  @IsOptional()
  @IsString()
  trackingUrlTemplate?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional settings as JSON' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
