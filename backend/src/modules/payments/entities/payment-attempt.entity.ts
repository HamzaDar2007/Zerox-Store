import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentAttemptStatus } from '@common/enums';
import { Payment } from './payment.entity';

@Entity('payment_attempts')
export class PaymentAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @ManyToOne(() => Payment, (payment) => payment.attempts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ name: 'attempt_number', type: 'integer' })
  attemptNumber: number;

  @Column({
    type: 'enum',
    enum: PaymentAttemptStatus,
    default: PaymentAttemptStatus.INITIATED,
  })
  status: PaymentAttemptStatus;

  @Column({ name: 'gateway_name', type: 'varchar', length: 50, nullable: true })
  gatewayName: string | null;

  @Column({ name: 'gateway_request', type: 'jsonb', nullable: true })
  gatewayRequest: Record<string, any> | null;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any> | null;

  @Column({ name: 'error_code', type: 'varchar', length: 50, nullable: true })
  errorCode: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
