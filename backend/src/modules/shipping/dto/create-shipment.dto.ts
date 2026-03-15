import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order UUID',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Warehouse UUID',
  })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Shipping method UUID',
  })
  @IsUUID()
  shippingMethodId: string;

  @ApiPropertyOptional({
    example: 'TRK-123456',
    description: 'Tracking number',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: 'TCS',
    description: 'Carrier name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  carrier?: string;
}
