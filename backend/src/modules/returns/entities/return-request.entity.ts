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
import { ReturnStatus, ReturnType, ReturnResolution } from '@common/enums';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { User } from '../../users/entities/user.entity';
import { ReturnReason } from './return-reason.entity';
import { ReturnImage } from './return-image.entity';
import { ReturnShipment } from './return-shipment.entity';

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'return_number', type: 'varchar', length: 50, unique: true })
  returnNumber: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId: string;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'reason_id', type: 'uuid', nullable: true })
  reasonId: string | null;

  @ManyToOne(() => ReturnReason)
  @JoinColumn({ name: 'reason_id' })
  reason: ReturnReason | null;

  @Column({ name: 'reason_details', type: 'text', nullable: true })
  reasonDetails: string | null;

  @Column({
    type: 'enum',
    enum: ReturnType,
  })
  type: ReturnType;

  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.REQUESTED,
  })
  status: ReturnStatus;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  refundAmount: number | null;

  @Column({
    type: 'enum',
    enum: ReturnResolution,
    nullable: true,
  })
  resolution: ReturnResolution | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewedByUser: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'reviewer_notes', type: 'text', nullable: true })
  reviewerNotes: string | null;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes: string | null;

  @Column({ name: 'received_at', type: 'timestamptz', nullable: true })
  receivedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => ReturnImage, (image) => image.returnRequest)
  images: ReturnImage[];

  @OneToMany(() => ReturnShipment, (shipment) => shipment.returnRequest)
  shipments: ReturnShipment[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
