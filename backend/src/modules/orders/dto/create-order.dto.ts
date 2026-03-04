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
  IsInt,
  IsBoolean,
  IsObject,
  IsDateString,
} from 'class-validator';
import { OrderStatus } from '@common/enums';

export class CreateOrderDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsUuidString()
  userId: string;

  @ApiProperty({ description: 'Store ID' })
  @IsNotEmpty()
  @IsUuidString()
  storeId: string;

  @ApiPropertyOptional({ description: 'Order status', enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Currency code', default: 'PKR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string;

  @ApiProperty({ description: 'Subtotal amount' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal: number;

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

  @ApiProperty({ description: 'Total amount' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Voucher ID' })
  @IsOptional()
  @IsUuidString()
  voucherId?: string;

  @ApiPropertyOptional({ description: 'Voucher code' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voucherCode?: string;

  @ApiProperty({ description: 'Shipping address as JSON' })
  @IsNotEmpty()
  @IsObject()
  shippingAddress: Record<string, any>;

  @ApiPropertyOptional({ description: 'Billing address as JSON' })
  @IsOptional()
  @IsObject()
  billingAddress?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Shipping method' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingMethod?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Customer notes' })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional({ description: 'Is this a gift?', default: false })
  @IsOptional()
  @IsBoolean()
  isGift?: boolean;

  @ApiPropertyOptional({ description: 'Gift message' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  giftMessage?: string;

  @ApiPropertyOptional({ description: 'Gift wrap requested', default: false })
  @IsOptional()
  @IsBoolean()
  giftWrapRequested?: boolean;

  @ApiPropertyOptional({ description: 'Loyalty points used', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  loyaltyPointsUsed?: number;

  @ApiPropertyOptional({ description: 'Estimated delivery date' })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Source platform', default: 'web' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sourcePlatform?: string;

  @ApiPropertyOptional({ description: 'Device type' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  deviceType?: string;

  @ApiPropertyOptional({ description: 'IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
