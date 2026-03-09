import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { CheckoutStep } from '@common/enums';

export class CreateCheckoutSessionDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUuidString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Cart ID (auto-detected from user if omitted)',
  })
  @IsOptional()
  @IsUuidString()
  cartId?: string;

  @ApiPropertyOptional({ description: 'Checkout step', enum: CheckoutStep })
  @IsOptional()
  @IsEnum(CheckoutStep)
  step?: CheckoutStep;

  @ApiPropertyOptional({ description: 'Shipping address ID' })
  @IsOptional()
  @IsUuidString()
  shippingAddressId?: string;

  @ApiPropertyOptional({ description: 'Billing address ID' })
  @IsOptional()
  @IsUuidString()
  billingAddressId?: string;

  @ApiPropertyOptional({ description: 'Shipping method ID' })
  @IsOptional()
  @IsUuidString()
  shippingMethodId?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Cart snapshot as JSON' })
  @IsOptional()
  cartSnapshot?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Subtotal', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Discount amount', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax amount', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Shipping amount', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  shippingAmount?: number;

  @ApiPropertyOptional({ description: 'Total amount', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'Loyalty points used', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  loyaltyPointsUsed?: number;

  @ApiPropertyOptional({ description: 'Loyalty discount', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  loyaltyDiscount?: number;

  @ApiPropertyOptional({ description: 'Gift wrap requested', default: false })
  @IsOptional()
  @IsBoolean()
  giftWrapRequested?: boolean;

  @ApiPropertyOptional({ description: 'Gift message' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  giftMessage?: string;

  @ApiPropertyOptional({ description: 'Device type (mobile, desktop, tablet)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  deviceType?: string;

  @ApiPropertyOptional({ description: 'IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Session expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
