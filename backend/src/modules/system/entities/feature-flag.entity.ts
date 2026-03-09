import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '@common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_enabled', type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({
    name: 'rollout_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  rolloutPercentage: number;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any> | null;

  @Column({
    name: 'enabled_for_roles',
    type: 'enum',
    enum: UserRole,
    array: true,
    nullable: true,
  })
  enabledForRoles: UserRole[] | null;

  @Column({
    name: 'enabled_for_users',
    type: 'uuid',
    array: true,
    nullable: true,
  })
  enabledForUsers: string[] | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
