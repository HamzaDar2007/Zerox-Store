import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUuidString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Product variant ID' })
  @IsOptional()
  @IsUuidString()
  productVariantId?: string;

  @ApiProperty({ description: 'Quantity requested' })
  @IsNumber()
  @Min(1)
  quantityRequested: number;
}

export class CreateInventoryTransferDto {
  @ApiProperty({ description: 'Source warehouse ID' })
  @IsUuidString()
  @IsNotEmpty()
  fromWarehouseId: string;

  @ApiProperty({ description: 'Destination warehouse ID' })
  @IsUuidString()
  @IsNotEmpty()
  toWarehouseId: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Transfer items', type: [TransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items: TransferItemDto[];
}
