import { IsUUID, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Warehouse UUID',
  })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Product variant UUID',
  })
  @IsUUID()
  variantId: string;

  @ApiProperty({
    example: 5,
    description: 'Quantity delta (positive to add, negative to subtract)',
  })
  @IsInt()
  delta: number;
}
