import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
