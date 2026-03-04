import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateTaxRateDto {
  @ApiProperty({ description: 'Tax class ID' })
  @IsNotEmpty()
  @IsUuidString()
  taxClassId: string;

  @ApiProperty({ description: 'Tax zone ID' })
  @IsNotEmpty()
  @IsUuidString()
  taxZoneId: string;

  @ApiProperty({ description: 'Tax rate name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Tax rate percentage' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  rate: number;

  @ApiPropertyOptional({ description: 'Priority (for compound taxes)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ description: 'Is compound tax', default: false })
  @IsOptional()
  @IsBoolean()
  isCompound?: boolean;

  @ApiPropertyOptional({ description: 'Applies to shipping', default: false })
  @IsOptional()
  @IsBoolean()
  isShipping?: boolean;
}
