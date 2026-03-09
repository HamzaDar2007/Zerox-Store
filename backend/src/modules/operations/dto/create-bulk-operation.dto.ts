import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsUUID,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { BulkOperationType } from '@common/enums';

export class CreateBulkOperationDto {
  @ApiProperty({ description: 'Bulk operation type', enum: BulkOperationType })
  @IsEnum(BulkOperationType)
  operationType: BulkOperationType;

  @ApiProperty({
    description: 'Entity type to operate on (e.g., product, order)',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  entityType: string;

  @ApiProperty({ description: 'Entity IDs to operate on', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  entityIds: string[];

  @ApiProperty({ description: 'Operation parameters', type: Object })
  parameters: Record<string, any>;
}
