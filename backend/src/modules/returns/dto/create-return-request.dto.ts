import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { ReturnStatus, ReturnType, ReturnResolution } from '@common/enums';

export class CreateReturnRequestDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsUuidString()
  orderId: string;

  @ApiProperty({ description: 'Order Item ID' })
  @IsNotEmpty()
  @IsUuidString()
  orderItemId: string;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsUuidString()
  userId: string;

  @ApiPropertyOptional({ description: 'Return reason ID' })
  @IsOptional()
  @IsUuidString()
  reasonId?: string;

  @ApiPropertyOptional({ description: 'Detailed reason for return' })
  @IsOptional()
  @IsString()
  reasonDetails?: string;

  @ApiProperty({ description: 'Return type', enum: ReturnType })
  @IsNotEmpty()
  @IsEnum(ReturnType)
  type: ReturnType;

  @ApiPropertyOptional({ description: 'Return status', enum: ReturnStatus })
  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;

  @ApiProperty({ description: 'Quantity to return' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Refund amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  refundAmount?: number;

  @ApiPropertyOptional({ description: 'Resolution type', enum: ReturnResolution })
  @IsOptional()
  @IsEnum(ReturnResolution)
  resolution?: ReturnResolution;

  @ApiPropertyOptional({ description: 'Customer notes' })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}
