import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolePermissionsDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Role UUID',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440001'],
    description: 'Array of permission UUIDs to assign',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
