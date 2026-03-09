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
} from 'class-validator';
import { DisputeStatus, DisputeType, DisputeResolution } from '@common/enums';

export class CreateDisputeDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsUuidString()
  orderId: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsNotEmpty()
  @IsUuidString()
  customerId: string;

  @ApiProperty({ description: 'Seller ID' })
  @IsNotEmpty()
  @IsUuidString()
  sellerId: string;

  @ApiProperty({ description: 'Dispute type', enum: DisputeType })
  @IsNotEmpty()
  @IsEnum(DisputeType)
  type: DisputeType;

  @ApiPropertyOptional({ description: 'Dispute status', enum: DisputeStatus })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiProperty({ description: 'Dispute subject' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiProperty({ description: 'Dispute description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Disputed amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  disputedAmount?: number;

  @ApiPropertyOptional({
    description: 'Resolution type',
    enum: DisputeResolution,
  })
  @IsOptional()
  @IsEnum(DisputeResolution)
  resolution?: DisputeResolution;

  @ApiPropertyOptional({ description: 'Resolution notes' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsUuidString()
  assignedTo?: string;
}
