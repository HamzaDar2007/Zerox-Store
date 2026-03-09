import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { DisputeStatus, DisputeType, DisputeResolution } from '@common/enums';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { DisputeMessage } from './dispute-message.entity';
import { DisputeEvidence } from './dispute-evidence.entity';

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dispute_number', type: 'varchar', length: 50, unique: true })
  disputeNumber: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'opened_by', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'opened_by' })
  customer: User;

  @Column({ name: 'against_user_id', type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'against_user_id' })
  seller: User;

  @Column({
    type: 'enum',
    enum: DisputeType,
  })
  type: DisputeType;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.OPEN,
  })
  status: DisputeStatus;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'disputed_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  disputedAmount: number | null;

  @Column({
    type: 'enum',
    enum: DisputeResolution,
    nullable: true,
  })
  resolution: DisputeResolution | null;

  @Column({ name: 'resolution_note', type: 'text', nullable: true })
  resolutionNotes: string | null;

  @Column({
    name: 'resolution_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  refundAmount: number | null;

  @Column({ name: 'assigned_admin_id', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_admin_id' })
  assignedToUser: User | null;

  @Column({ name: 'escalated_at', type: 'timestamptz', nullable: true })
  escalatedAt: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolved_by' })
  resolvedByUser: User | null;

  @OneToMany(() => DisputeMessage, (message) => message.dispute)
  messages: DisputeMessage[];

  @OneToMany(() => DisputeEvidence, (evidence) => evidence.dispute)
  evidence: DisputeEvidence[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
