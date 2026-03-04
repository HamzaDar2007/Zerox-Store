import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateTranslationDto {
  @ApiProperty({ description: 'Language ID' })
  @IsUuidString()
  languageId: string;

  @ApiProperty({
    description: 'Entity type (e.g., product, category)',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsUuidString()
  entityId: string;

  @ApiProperty({
    description: 'Field name to translate (e.g., name, description)',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  fieldName: string;

  @ApiProperty({ description: 'Translated text value' })
  @IsString()
  translatedValue: string;

  @ApiPropertyOptional({
    description: 'Whether this was auto-translated',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAutoTranslated?: boolean;
}
