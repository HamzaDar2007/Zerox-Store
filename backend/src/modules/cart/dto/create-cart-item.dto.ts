import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product variant UUID',
  })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 2, description: 'Quantity (min 1)', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
