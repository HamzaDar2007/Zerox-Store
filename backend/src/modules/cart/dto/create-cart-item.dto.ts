import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateCartItemDto {
  @ApiPropertyOptional({ description: 'Cart ID (auto-resolved from user if omitted)' })
  @IsOptional()
  @IsUuidString()
  cartId?: string;

  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsUuidString()
  productId: string;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsOptional()
  @IsUuidString()
  variantId?: string;

  @ApiPropertyOptional({ description: 'Quantity', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Price at the time of addition (auto-resolved if omitted)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceAtAddition?: number;
}
