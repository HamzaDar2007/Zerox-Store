import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsIP,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Actor user UUID',
  })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiProperty({
    example: 'UPDATE',
    description: 'Action performed',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @ApiProperty({
    example: 'products',
    description: 'Database table affected',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tableName: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Record UUID',
  })
  @IsOptional()
  @IsUUID()
  recordId?: string;

  @ApiPropertyOptional({
    example: { name: { from: 'Old', to: 'New' } },
    description: 'Changes diff',
  })
  @IsOptional()
  @IsObject()
  diff?: Record<string, any>;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'Client IP address',
  })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0...',
    description: 'User agent string',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
