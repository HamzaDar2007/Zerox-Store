import { IsUUID, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetStockDto {
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

  @ApiProperty({ example: 100, description: 'Quantity on hand', minimum: 0 })
  @IsInt()
  @Min(0)
  qtyOnHand: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Low stock alert threshold',
  })
  @IsOptional()
  @IsInt()
  lowStockThreshold?: number;
}
