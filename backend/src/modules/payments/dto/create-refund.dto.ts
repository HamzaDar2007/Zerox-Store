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
  IsObject,
} from 'class-validator';
import { RefundStatus, RefundReason } from '@common/enums';

export class CreateRefundDto {
  @ApiProperty({ description: 'Payment ID' })
  @IsNotEmpty()
  @IsUuidString()
  paymentId: string;

  @ApiProperty({ description: 'Refund amount' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Refund reason', enum: RefundReason })
  @IsOptional()
  @IsEnum(RefundReason)
  reason?: RefundReason;

  @ApiPropertyOptional({ description: 'Detailed reason for refund' })
  @IsOptional()
  @IsString()
  reasonDetails?: string;

  @ApiPropertyOptional({ description: 'Refund status', enum: RefundStatus })
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;

  @ApiPropertyOptional({ description: 'Gateway refund ID' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gatewayRefundId?: string;

  @ApiPropertyOptional({ description: 'Gateway response data' })
  @IsOptional()
  @IsObject()
  gatewayResponse?: Record<string, any>;

  @ApiPropertyOptional({ description: 'User ID who processed the refund' })
  @IsOptional()
  @IsUuidString()
  processedBy?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
