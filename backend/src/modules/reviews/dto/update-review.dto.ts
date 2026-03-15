import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../../../common/enums/review.enum';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 'approved',
    description: 'New review status',
    maxLength: 20,
    enum: ReviewStatus,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(Object.values(ReviewStatus))
  status?: string;
}
