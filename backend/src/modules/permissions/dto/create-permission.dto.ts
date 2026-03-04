import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Permissive UUID pattern: 8-4-4-4-12 hex chars
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Role ID this permission belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Matches(UUID_PATTERN, { message: 'Role ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;

  @ApiProperty({
    description: 'Module the permission applies to',
    example: 'users',
    maxLength: 50,
  })
  @IsString({ message: 'Module must be a string' })
  @IsNotEmpty({ message: 'Module is required' })
  @MaxLength(50, { message: 'Module cannot exceed 50 characters' })
  module: string;

  @ApiProperty({
    description: 'Action allowed by this permission',
    example: 'create',
    maxLength: 50,
  })
  @IsString({ message: 'Action must be a string' })
  @IsNotEmpty({ message: 'Action is required' })
  @MaxLength(50, { message: 'Action cannot exceed 50 characters' })
  action: string;
}
