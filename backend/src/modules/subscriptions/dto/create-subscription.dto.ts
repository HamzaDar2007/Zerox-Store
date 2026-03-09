import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { SubscriptionFrequency } from '@common/enums';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Product ID to subscribe to' })
  @IsUuidString()
  productId: string;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsOptional()
  @IsUuidString()
  variantId?: string;

  @ApiPropertyOptional({ description: 'Quantity per delivery', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    description: 'Delivery frequency',
    enum: SubscriptionFrequency,
  })
  @IsEnum(SubscriptionFrequency)
  frequency: SubscriptionFrequency;

  @ApiProperty({ description: 'Delivery address ID' })
  @IsUuidString()
  deliveryAddressId: string;

  @ApiPropertyOptional({ description: 'Saved payment method ID' })
  @IsOptional()
  @IsUuidString()
  paymentMethodId?: string;

  @ApiProperty({ description: 'Unit price per item' })
  @IsNumber()
  @Min(0.01)
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Discount percentage (0-50)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  discountPercentage?: number;

  @ApiProperty({ description: 'First delivery date (YYYY-MM-DD)' })
  @IsDateString()
  nextDeliveryDate: string;
}
