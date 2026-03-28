import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeKeyDto {
  @ApiProperty({ example: 'Color', description: 'Attribute name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'color', description: 'URL-safe slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @ApiProperty({
    example: 'select',
    description: 'Input type (text, select, color)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  inputType: string;
}
