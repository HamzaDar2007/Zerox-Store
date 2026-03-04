import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsUrl,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ImportJobType } from '@common/enums';

export class CreateImportExportJobDto {
  @ApiProperty({ description: 'Job type', enum: ImportJobType })
  @IsEnum(ImportJobType)
  type: ImportJobType;

  @ApiPropertyOptional({ description: 'Source file URL (for imports)', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  sourceFileUrl?: string;

  @ApiPropertyOptional({ description: 'Total number of rows to process', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalRows?: number;

  @ApiPropertyOptional({ description: 'Job-specific options', type: Object })
  @IsOptional()
  options?: Record<string, any>;
}
