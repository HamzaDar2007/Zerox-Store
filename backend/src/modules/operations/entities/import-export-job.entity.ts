import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ImportJobType, JobStatus } from '@common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('import_export_jobs')
export class ImportExportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ImportJobType,
  })
  type: ImportJobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @Column({ name: 'source_file_url', type: 'varchar', length: 500, nullable: true })
  sourceFileUrl: string | null;

  @Column({ name: 'result_file_url', type: 'varchar', length: 500, nullable: true })
  resultFileUrl: string | null;

  @Column({ name: 'total_rows', type: 'integer', default: 0 })
  totalRows: number;

  @Column({ name: 'processed_rows', type: 'integer', default: 0 })
  processedRows: number;

  @Column({ name: 'success_rows', type: 'integer', default: 0 })
  successRows: number;

  @Column({ name: 'failed_rows', type: 'integer', default: 0 })
  failedRows: number;

  @Column({ name: 'error_log', type: 'jsonb', nullable: true })
  errorLog: Record<string, any>[] | null;

  @Column({ name: 'error_summary', type: 'text', nullable: true })
  errorSummary: string | null;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, any> | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
