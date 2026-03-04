import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RefundStatus, RefundReason } from '@common/enums';
import { Payment } from './payment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('refunds')
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ name: 'refund_number', type: 'varchar', length: 50, unique: true })
  refundNumber: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: RefundReason,
    nullable: true,
  })
  reason: RefundReason | null;

  @Column({ name: 'reason_details', type: 'text', nullable: true })
  reasonDetails: string | null;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ name: 'gateway_refund_id', type: 'varchar', length: 255, nullable: true })
  gatewayRefundId: string | null;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any> | null;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'processed_by' })
  processedByUser: User | null;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
