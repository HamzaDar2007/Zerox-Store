import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateWishlistDto {
  @ApiPropertyOptional({ description: 'Notify on sale' })
  @IsOptional()
  @IsBoolean()
  notifyOnSale?: boolean;

  @ApiPropertyOptional({ description: 'Notify on restock' })
  @IsOptional()
  @IsBoolean()
  notifyOnRestock?: boolean;
}
