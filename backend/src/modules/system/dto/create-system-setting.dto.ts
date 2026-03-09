import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateSystemSettingDto {
  @ApiProperty({
    description: 'Setting group (e.g., general, email, payment)',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  group: string;

  @ApiProperty({
    description: 'Unique setting key (snake_case)',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'key must be lowercase snake_case',
  })
  key: string;

  @ApiPropertyOptional({ description: 'Setting value as string' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({
    description: 'Value type for validation/parsing',
    maxLength: 20,
    default: 'string',
    enum: [
      'string',
      'integer',
      'decimal',
      'boolean',
      'json',
      'text',
      'url',
      'email',
    ],
  })
  @IsString()
  @MaxLength(20)
  valueType: string;

  @ApiPropertyOptional({
    description: 'Human-readable display name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Setting description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the setting is publicly accessible',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the value is encrypted',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;
}
