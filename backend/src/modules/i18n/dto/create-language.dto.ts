import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { TextDirection } from '@common/enums';

export class CreateLanguageDto {
  @ApiProperty({ description: 'Language code (e.g., en, en-US)', maxLength: 5 })
  @IsString()
  @MaxLength(5)
  code: string;

  @ApiProperty({ description: 'Language name in English', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Language name in native language',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nativeName?: string;

  @ApiPropertyOptional({
    description: 'Text direction',
    enum: TextDirection,
    default: TextDirection.LTR,
  })
  @IsOptional()
  @IsEnum(TextDirection)
  direction?: TextDirection;

  @ApiPropertyOptional({
    description: 'Set as default language',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the language is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
