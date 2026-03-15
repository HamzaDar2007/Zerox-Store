import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsInt,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingMethodDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Shipping zone UUID',
  })
  @IsUUID()
  zoneId: string;

  @ApiProperty({
    example: 'Standard Delivery',
    description: 'Method name',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: 'TCS',
    description: 'Carrier name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  carrier?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Minimum estimated delivery days',
  })
  @IsOptional()
  @IsInt()
  estimatedDaysMin?: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'Maximum estimated delivery days',
  })
  @IsOptional()
  @IsInt()
  estimatedDaysMax?: number;

  @ApiProperty({ example: 200, description: 'Base shipping rate' })
  @IsNumber()
  @Min(0)
  baseRate: number;

  @ApiProperty({ example: 50, description: 'Rate per kilogram' })
  @IsNumber()
  @Min(0)
  perKgRate: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Free shipping threshold',
  })
  @IsOptional()
  @IsNumber()
  freeThreshold?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the method is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
