import {
  IsUUID,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReturnItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order item UUID',
  })
  @IsUUID()
  orderItemId: string;

  @ApiProperty({ example: 1, description: 'Quantity to return', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: 'damaged',
    description: 'Item condition',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  condition?: string;

  @ApiPropertyOptional({
    example: 'Box was torn and product scratched',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
