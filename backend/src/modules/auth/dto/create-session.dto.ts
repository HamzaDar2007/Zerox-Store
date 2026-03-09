import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;

  @ApiProperty({
    description: 'Expiration date',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString({}, { message: 'Invalid expiration date' })
  @IsNotEmpty({ message: 'Expiration date is required' })
  expiresAt: string;

  @ApiPropertyOptional({
    description: 'IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString({ message: 'IP address must be a string' })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
  })
  @IsOptional()
  @IsString({ message: 'User agent must be a string' })
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Device fingerprint',
    example: 'abc123def456',
  })
  @IsOptional()
  @IsString({ message: 'Device fingerprint must be a string' })
  deviceFingerprint?: string;
}
