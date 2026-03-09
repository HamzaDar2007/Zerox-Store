import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateWishlistDto {
  @ApiPropertyOptional({
    description: 'User ID (auto-resolved from auth if omitted)',
  })
  @IsOptional()
  @IsUuidString()
  userId?: string;

  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsUuidString()
  productId: string;

  @ApiPropertyOptional({ description: 'Notify on sale', default: false })
  @IsOptional()
  @IsBoolean()
  notifyOnSale?: boolean;

  @ApiPropertyOptional({ description: 'Notify on restock', default: false })
  @IsOptional()
  @IsBoolean()
  notifyOnRestock?: boolean;
}
