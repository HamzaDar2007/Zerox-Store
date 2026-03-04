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

@Entity('dispute_messages')
export class DisputeMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dispute_id', type: 'uuid' })
  disputeId: string;

  @ManyToOne(() => Dispute, (dispute) => dispute.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_internal', type: 'boolean', default: false })
  isInternal: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Record<string, any>[] | null;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
