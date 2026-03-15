import { ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderWithItemsDto {
  @ApiProperty({ type: CreateOrderDto })
  @ValidateNested()
  @Type(() => CreateOrderDto)
  order: CreateOrderDto;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsArray()
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];
}
