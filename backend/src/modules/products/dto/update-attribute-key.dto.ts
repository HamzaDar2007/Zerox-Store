import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttributeKeyDto {
  @ApiPropertyOptional({ example: 'Color', description: 'Attribute name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'color', description: 'URL-safe slug' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({
    example: 'select',
    description: 'Input type (text, select, color)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  inputType?: string;
}
