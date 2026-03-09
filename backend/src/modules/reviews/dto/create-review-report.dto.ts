import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ReviewReportReason, ReviewReportStatus } from '@common/enums';

export class CreateReviewReportDto {
  @ApiProperty({ description: 'Review ID' })
  @IsNotEmpty()
  @IsUuidString()
  reviewId: string;

  @ApiProperty({ description: 'User ID who reported' })
  @IsNotEmpty()
  @IsUuidString()
  reportedBy: string;

  @ApiProperty({ description: 'Report reason', enum: ReviewReportReason })
  @IsNotEmpty()
  @IsEnum(ReviewReportReason)
  reason: ReviewReportReason;

  @ApiPropertyOptional({ description: 'Additional details' })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    description: 'Report status',
    enum: ReviewReportStatus,
  })
  @IsOptional()
  @IsEnum(ReviewReportStatus)
  status?: ReviewReportStatus;
}
