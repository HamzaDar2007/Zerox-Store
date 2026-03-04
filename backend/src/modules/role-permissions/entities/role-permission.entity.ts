// DEPRECATED: This entity is not part of the current migration schema
// The migration uses a direct permissions table with role_id instead
// Keeping this file for backwards compatibility but it should not be used

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @Column({ name: 'permission_id' })
  permissionId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
