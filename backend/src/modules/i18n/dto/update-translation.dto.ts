import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTranslationDto {
  @ApiPropertyOptional({ description: 'Updated translated text value' })
  @IsOptional()
  @IsString()
  translatedValue?: string;

  @ApiPropertyOptional({ description: 'Whether this was auto-translated' })
  @IsOptional()
  @IsBoolean()
  isAutoTranslated?: boolean;
}
