import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'products.create',
    description: 'Permission code',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  code: string;

  @ApiProperty({
    example: 'products',
    description: 'Module this permission belongs to',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  module: string;

  @ApiPropertyOptional({
    example: 'Allow creating new products',
    description: 'Permission description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
