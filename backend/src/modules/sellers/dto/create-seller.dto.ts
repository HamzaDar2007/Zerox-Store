import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellerDto {
  @ApiProperty({
    example: 'TechStore',
    description: 'Display name of the seller',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  displayName: string;

  @ApiPropertyOptional({
    example: 'Tech Store Pvt Ltd',
    description: 'Legal business name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({
    example: 'NTN-1234567',
    description: 'Tax identification number',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxId?: string;
}
