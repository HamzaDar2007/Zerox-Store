import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateTaxClassDto {
  @ApiProperty({ description: 'Tax class name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Tax class description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is default tax class', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
