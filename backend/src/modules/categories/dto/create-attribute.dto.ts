import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType } from '@common/enums';

export class CreateAttributeDto {
  @ApiProperty({ description: 'Attribute name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ description: 'Attribute slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Attribute group ID' })
  @IsOptional()
  @IsUuidString()
  attributeGroupId?: string;

  @ApiPropertyOptional({ enum: AttributeType, default: AttributeType.TEXT })
  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType;

  @ApiPropertyOptional({ description: 'Unit (e.g., cm, kg, ml)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: 'Is filterable in product listing', default: false })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({ description: 'Is required attribute', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Is variant attribute (like size, color)', default: false })
  @IsOptional()
  @IsBoolean()
  isVariantAttribute?: boolean;
}
