import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  IsUUID,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { UserRole } from '@common/enums';

export class CreateFeatureFlagDto {
  @ApiProperty({
    description: 'Feature flag name (snake_case)',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'name must be lowercase snake_case',
  })
  name: string;

  @ApiPropertyOptional({ description: 'Feature flag description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the feature is enabled globally',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Percentage of users to enable for (0-100)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;

  @ApiPropertyOptional({
    description: 'Custom conditions as JSON',
    type: Object,
  })
  @IsOptional()
  conditions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Roles for which feature is enabled',
    enum: UserRole,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  enabledForRoles?: UserRole[];

  @ApiPropertyOptional({
    description: 'Specific user IDs for which feature is enabled',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  enabledForUsers?: string[];
}
