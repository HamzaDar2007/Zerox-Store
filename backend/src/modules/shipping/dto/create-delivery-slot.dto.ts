import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateDeliverySlotDto {
  @ApiProperty({ description: 'Delivery slot name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Start time (HH:MM:SS)' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time (HH:MM:SS)' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Days of week (0=Sunday, 6=Saturday)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({ description: 'Maximum orders for this slot' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxOrders?: number;

  @ApiPropertyOptional({
    description: 'Additional fee for this slot',
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  additionalFee?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
