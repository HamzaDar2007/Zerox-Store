import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the user to register as seller',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

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
