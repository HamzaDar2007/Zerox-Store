import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsDateString,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { SubscriptionStatus, SubscriptionFrequency } from '@common/enums';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ description: 'Quantity per delivery' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Delivery frequency',
    enum: SubscriptionFrequency,
  })
  @IsOptional()
  @IsEnum(SubscriptionFrequency)
  frequency?: SubscriptionFrequency;

  @ApiPropertyOptional({ description: 'Delivery address ID' })
  @IsOptional()
  @IsUuidString()
  deliveryAddressId?: string;

  @ApiPropertyOptional({ description: 'Saved payment method ID' })
  @IsOptional()
  @IsUuidString()
  paymentMethodId?: string;

  @ApiPropertyOptional({ description: 'Discount percentage (0-50)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  discountPercentage?: number;

  @ApiPropertyOptional({ description: 'Next delivery date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  nextDeliveryDate?: string;

  @ApiPropertyOptional({
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ description: 'Cancellation reason (when cancelling)' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
