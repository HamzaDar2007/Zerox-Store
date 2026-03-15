import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({
    example: 'WH-LHR-01',
    description: 'Warehouse code',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({
    example: 'Lahore Main Warehouse',
    description: 'Warehouse name',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: '45 Industrial Area', description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiProperty({ example: 'Lahore', description: 'City', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Pakistan', description: 'Country', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the warehouse is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
