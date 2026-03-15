import { IsUUID, IsNumber, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlashSaleItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Flash sale UUID',
  })
  @IsUUID()
  flashSaleId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Product variant UUID',
  })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 2999.99, description: 'Sale price' })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum quantity for sale',
  })
  @IsOptional()
  @IsInt()
  quantityLimit?: number;

  @ApiPropertyOptional({ example: 10, description: 'Quantity already sold' })
  @IsOptional()
  @IsInt()
  quantitySold?: number;
}
