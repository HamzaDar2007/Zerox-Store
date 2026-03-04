import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { RecommendationType } from '@common/enums';

export class CreateProductRecommendationDto {
  @ApiProperty({ description: 'Source product ID' })
  @IsNotEmpty()
  @IsUuidString()
  sourceProductId: string;

  @ApiProperty({ description: 'Recommended product ID' })
  @IsNotEmpty()
  @IsUuidString()
  recommendedProductId: string;

  @ApiProperty({ description: 'Recommendation type', enum: RecommendationType })
  @IsNotEmpty()
  @IsEnum(RecommendationType)
  type: RecommendationType;

  @ApiPropertyOptional({ description: 'Recommendation score', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  score?: number;

  @ApiPropertyOptional({ description: 'Is manually created', default: false })
  @IsOptional()
  @IsBoolean()
  isManual?: boolean;
}
