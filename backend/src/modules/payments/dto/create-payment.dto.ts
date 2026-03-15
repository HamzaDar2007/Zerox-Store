import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsObject,
  MaxLength,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order UUID',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    example: 'stripe',
    description: 'Payment gateway',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  gateway: string;

  @ApiProperty({
    example: 'credit_card',
    description: 'Payment method',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  method: string;

  @ApiProperty({ example: 9849.98, description: 'Payment amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'PKR', description: 'Currency code (ISO 3-letter)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiPropertyOptional({
    example: 'txn_abc123',
    description: 'Gateway transaction ID',
  })
  @IsOptional()
  @IsString()
  gatewayTxId?: string;

  @ApiPropertyOptional({
    example: { cardLast4: '4242' },
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
