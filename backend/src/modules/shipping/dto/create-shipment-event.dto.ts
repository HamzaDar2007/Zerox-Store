import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from '../../../common/enums/shipping.enum';

export class CreateShipmentEventDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Shipment UUID',
  })
  @IsUUID()
  shipmentId: string;

  @ApiProperty({
    example: 'in_transit',
    description: 'Event status',
    enum: ShipmentStatus,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(ShipmentStatus))
  status: string;

  @ApiPropertyOptional({
    example: 'Lahore Hub',
    description: 'Event location',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional({
    example: 'Package arrived at sorting facility',
    description: 'Event description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: '2024-07-15T14:30:00Z',
    description: 'When the event occurred',
  })
  @IsOptional()
  @IsDateString()
  occurredAt?: Date;
}
