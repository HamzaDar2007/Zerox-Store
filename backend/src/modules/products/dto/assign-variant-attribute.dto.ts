import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignVariantAttributeDto {
  @ApiProperty({ description: 'Attribute key UUID' })
  @IsUUID()
  @IsNotEmpty()
  attributeKeyId: string;

  @ApiProperty({ description: 'Attribute value UUID' })
  @IsUUID()
  @IsNotEmpty()
  attributeValueId: string;
}
