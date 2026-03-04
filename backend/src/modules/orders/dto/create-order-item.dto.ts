import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { OrderItemStatus } from '@common/enums';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsUuidString()
  orderId: string;

  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsUuidString()
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  @IsOptional()
  @IsUuidString()
  variantId?: string;

  @ApiProperty({ description: 'Product snapshot as JSON' })
  @IsNotEmpty()
  @IsObject()
  productSnapshot: Record<string, any>;

  @ApiProperty({ description: 'Quantity' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Original price before discount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  originalPrice?: number;

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

  @ApiProperty({ description: 'Total amount' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Item status', enum: OrderItemStatus })
  @IsOptional()
  @IsEnum(OrderItemStatus)
  status?: OrderItemStatus;

  @ApiPropertyOptional({ description: 'Is this item a gift?', default: false })
  @IsOptional()
  @IsBoolean()
  isGift?: boolean;
}
