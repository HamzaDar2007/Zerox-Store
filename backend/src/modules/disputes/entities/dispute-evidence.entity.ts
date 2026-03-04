import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dispute } from './dispute.entity';
import { User } from '../../users/entities/user.entity';

@Entity('dispute_evidence')
export class DisputeEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dispute_id', type: 'uuid' })
  disputeId: string;

  @ManyToOne(() => Dispute, (dispute) => dispute.evidence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @Column({ name: 'submitted_by', type: 'uuid' })
  submittedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by' })
  submittedByUser: User;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: string;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
