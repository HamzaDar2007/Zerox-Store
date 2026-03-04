import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockMovementType } from '@common/enums';

export class CreateStockMovementDto {
  @ApiProperty({ description: 'Inventory ID' })
  @IsUuidString()
  @IsNotEmpty()
  inventoryId: string;

  @ApiProperty({ enum: StockMovementType })
  @IsEnum(StockMovementType)
  @IsNotEmpty()
  type: StockMovementType;

  @ApiProperty({ description: 'Quantity (positive number)' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Reference type (e.g., order, transfer)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsUuidString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Cost per unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;
}
