import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ReviewStatus } from '@common/enums';

export class CreateReviewDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsUuidString()
  productId: string;

  @ApiPropertyOptional({ description: 'Order ID (for verified purchase)' })
  @IsOptional()
  @IsUuidString()
  orderId?: string;

  @ApiProperty({ description: 'Rating (1-5)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Review title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Review content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Pros list' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pros?: string[];

  @ApiPropertyOptional({ description: 'Cons list' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cons?: string[];

  @ApiPropertyOptional({ description: 'Review images URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Is verified purchase', default: false })
  @IsOptional()
  @IsBoolean()
  isVerifiedPurchase?: boolean;

  @ApiPropertyOptional({ description: 'Review status', enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}
