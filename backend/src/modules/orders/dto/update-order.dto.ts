import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../common/enums/order.enum';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    example: 'confirmed',
    description: 'New order status',
    maxLength: 30,
    enum: OrderStatus,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsIn(Object.values(OrderStatus))
  status?: string;
}
