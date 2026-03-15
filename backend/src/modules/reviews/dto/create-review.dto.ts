import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product UUID',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Order UUID (for verified purchase)',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    example: 'Excellent headphones!',
    description: 'Review title',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({
    example: 'Great sound quality and comfortable to wear...',
    description: 'Review body',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  body?: string;
}
