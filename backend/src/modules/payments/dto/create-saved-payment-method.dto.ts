import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsObject,
  IsDateString,
} from 'class-validator';
import { PaymentMethod } from '@common/enums';

export class CreateSavedPaymentMethodDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsUuidString()
  userId: string;

  @ApiProperty({ description: 'Payment method type', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Nickname for the payment method' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Is this the default payment method',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Gateway token for the payment method' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  gatewayToken?: string;

  @ApiPropertyOptional({ description: 'Last 4 digits of card' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  cardLastFour?: string;

  @ApiPropertyOptional({ description: 'Card brand (Visa, Mastercard, etc.)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cardBrand?: string;

  @ApiPropertyOptional({ description: 'Card expiry month' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  cardExpiryMonth?: number;

  @ApiPropertyOptional({ description: 'Card expiry year' })
  @IsOptional()
  @IsInt()
  @Min(2020)
  cardExpiryYear?: number;

  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ description: 'Last 4 digits of bank account' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  accountLastFour?: string;

  @ApiPropertyOptional({ description: 'Wallet provider name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  walletProvider?: string;

  @ApiPropertyOptional({ description: 'Wallet ID' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  walletId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
