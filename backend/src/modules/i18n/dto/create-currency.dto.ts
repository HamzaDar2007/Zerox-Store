import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ description: 'ISO 4217 currency code (e.g., USD, EUR)', maxLength: 3 })
  @IsString()
  @MaxLength(3)
  code: string;

  @ApiProperty({ description: 'Currency name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Currency symbol (e.g., $, €)', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  symbol: string;

  @ApiPropertyOptional({
    description: 'Symbol position (before or after)',
    maxLength: 10,
    default: 'before',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  symbolPosition?: string;

  @ApiPropertyOptional({ description: 'Number of decimal places (0-6)', default: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  decimalPlaces?: number;

  @ApiPropertyOptional({ description: 'Thousands separator', maxLength: 3, default: ',' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  thousandsSeparator?: string;

  @ApiPropertyOptional({ description: 'Decimal separator', maxLength: 3, default: '.' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  decimalSeparator?: string;

  @ApiPropertyOptional({ description: 'Exchange rate relative to base currency', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number;

  @ApiPropertyOptional({ description: 'Set as default currency', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Whether the currency is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
