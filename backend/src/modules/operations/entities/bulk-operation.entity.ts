import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BulkOperationType, JobStatus } from '@common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('bulk_operations')
export class BulkOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'operation_type',
    type: 'enum',
    enum: BulkOperationType,
  })
  operationType: BulkOperationType;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @Column({ name: 'entity_ids', type: 'uuid', array: true })
  entityIds: string[];

  @Column({ type: 'jsonb' })
  parameters: Record<string, any>;

  @Column({ name: 'total_count', type: 'integer' })
  totalCount: number;

  @Column({ name: 'success_count', type: 'integer', default: 0 })
  successCount: number;

  @Column({ name: 'failure_count', type: 'integer', default: 0 })
  failureCount: number;

  @Column({ name: 'error_log', type: 'jsonb', nullable: true })
  errorLog: Record<string, any>[] | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
