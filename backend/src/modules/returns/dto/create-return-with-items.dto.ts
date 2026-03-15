import { ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateReturnRequestDto } from './create-return-request.dto';
import { CreateReturnItemDto } from './create-return-item.dto';

export class CreateReturnWithItemsDto {
  @ApiProperty({ type: CreateReturnRequestDto })
  @ValidateNested()
  @Type(() => CreateReturnRequestDto)
  return: CreateReturnRequestDto;

  @ApiPropertyOptional({ type: [CreateReturnItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  @IsArray()
  @IsOptional()
  items?: CreateReturnItemDto[];
}
