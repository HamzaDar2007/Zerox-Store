import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReviewReportStatus, ReviewReportReason } from '@common/enums';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';

@Entity('review_reports')
export class ReviewReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'review_id', type: 'uuid' })
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'reported_by', type: 'uuid' })
  reportedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reportedByUser: User;

  @Column({
    type: 'enum',
    enum: ReviewReportReason,
  })
  reason: ReviewReportReason;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({
    type: 'enum',
    enum: ReviewReportStatus,
    default: ReviewReportStatus.PENDING,
  })
  status: ReviewReportStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewedByUser: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
