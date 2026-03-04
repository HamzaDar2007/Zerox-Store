import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The unique name of the role',
    example: 'super_admin',
    maxLength: 50,
  })
  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name is required' })
  @MaxLength(50, { message: 'Role name cannot exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Display name for the role',
    example: 'Super Administrator',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Display name must be a string' })
  @MaxLength(100, { message: 'Display name cannot exceed 100 characters' })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'A description for the role',
    example: 'Grants full administrative access.',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a system role (cannot be deleted)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isSystem must be a boolean' })
  isSystem?: boolean;
}
