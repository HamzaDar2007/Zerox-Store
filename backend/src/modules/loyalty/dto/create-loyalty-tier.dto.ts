import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsUrl,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateLoyaltyTierDto {
  @ApiProperty({ description: 'Tier name', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Minimum points required for this tier',
    default: 0,
  })
  @IsInt()
  @Min(0)
  minPoints: number;

  @ApiPropertyOptional({ description: 'Maximum points (null for unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPoints?: number;

  @ApiPropertyOptional({
    description: 'Points earn multiplier (0.5-10)',
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(10)
  earnMultiplier?: number;

  @ApiPropertyOptional({ description: 'Tier benefits as JSON', type: Object })
  @IsOptional()
  benefits?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Icon URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Color hex code (e.g., #FF5733)',
    maxLength: 7,
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'colorHex must be a valid hex color',
  })
  colorHex?: string;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the tier is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
