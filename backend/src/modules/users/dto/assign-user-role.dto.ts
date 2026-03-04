import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Permissive UUID pattern: 8-4-4-4-12 hex chars
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AssignUserRoleDto {
  @ApiProperty({
    description: 'User ID to assign role to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Matches(UUID_PATTERN, { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    description: 'Role ID to assign',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Matches(UUID_PATTERN, { message: 'Role ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;
}
