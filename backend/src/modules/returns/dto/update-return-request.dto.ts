import {
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReturnStatus } from '../../../common/enums/return.enum';

export class UpdateReturnRequestDto {
  @ApiPropertyOptional({
    example: 'approved',
    description: 'New return status',
    maxLength: 30,
    enum: ReturnStatus,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsIn(Object.values(ReturnStatus))
  status?: string;

  @ApiPropertyOptional({ example: 4999.99, description: 'Refund amount' })
  @IsOptional()
  @IsNumber()
  refundAmount?: number;
}
