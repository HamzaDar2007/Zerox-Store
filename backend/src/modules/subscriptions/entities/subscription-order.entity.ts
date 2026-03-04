import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('subscription_orders')
export class SubscriptionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (sub) => sub.subscriptionOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order | null;

  @Column({ name: 'scheduled_date', type: 'date' })
  scheduledDate: Date;

  @Column({ name: 'actual_date', type: 'date', nullable: true })
  actualDate: Date | null;

  @Column({ type: 'varchar', length: 30, default: 'scheduled' })
  status: string;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ name: 'retry_count', type: 'smallint', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
