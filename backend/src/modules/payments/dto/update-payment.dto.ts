import {
  IsString,
  IsOptional,
  IsObject,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../../common/enums/payment.enum';

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    example: 'paid',
    description: 'New payment status',
    maxLength: 20,
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(Object.values(PaymentStatus))
  status?: string;

  @ApiPropertyOptional({
    example: 'txn_abc123',
    description: 'Gateway transaction ID',
  })
  @IsOptional()
  @IsString()
  gatewayTxId?: string;

  @ApiPropertyOptional({
    example: { receiptUrl: 'https://...' },
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
