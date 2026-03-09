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
import { PaymentStatus, PaymentMethod } from '@common/enums';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsUuidString()
  orderId: string;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsUuidString()
  userId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'PKR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment status', enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Payment gateway name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gatewayName?: string;

  @ApiPropertyOptional({ description: 'Gateway transaction ID' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gatewayTransactionId?: string;

  @ApiPropertyOptional({ description: 'Gateway response data' })
  @IsOptional()
  @IsObject()
  gatewayResponse?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Stripe PaymentMethod ID (pm_xxx) for Stripe payments',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  stripePaymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Stripe Customer ID (cus_xxx) for returning customers',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  stripeCustomerId?: string;
}
