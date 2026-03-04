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
  IsDateString,
} from 'class-validator';
import { ShipmentStatus } from '@common/enums';

export class CreateShipmentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsUuidString()
  orderId: string;

  @ApiProperty({ description: 'Shipment number' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  shipmentNumber: string;

  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsUuidString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Carrier name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carrierName?: string;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Tracking URL' })
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiPropertyOptional({ description: 'Shipment status', enum: ShipmentStatus })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @ApiPropertyOptional({ description: 'Shipping cost', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional({ description: 'Weight in kg' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weightKg?: number;

  @ApiPropertyOptional({ description: 'Dimensions as JSON' })
  @IsOptional()
  @IsObject()
  dimensions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Estimated delivery date' })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryAt?: string;

  @ApiProperty({ description: 'Delivery address as JSON' })
  @IsNotEmpty()
  @IsObject()
  deliveryAddress: Record<string, any>;

  @ApiPropertyOptional({ description: 'Delivery instructions' })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
