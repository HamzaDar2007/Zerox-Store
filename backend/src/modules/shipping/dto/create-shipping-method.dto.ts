import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateShippingMethodDto {
  @ApiProperty({ description: 'Shipping method name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Shipping method description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Estimated minimum delivery days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDaysMin?: number;

  @ApiPropertyOptional({ description: 'Estimated maximum delivery days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDaysMax?: number;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
