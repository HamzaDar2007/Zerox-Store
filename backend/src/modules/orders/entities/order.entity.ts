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
import { OrderStatus } from '@common/enums';
import { User } from '../../users/entities/user.entity';
import { Store } from '../../sellers/entities/store.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { Shipment } from './shipment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'currency_code', type: 'varchar', length: 3, default: 'PKR' })
  currencyCode: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'shipping_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2 })
  totalAmount: number;

  @Column({ name: 'voucher_id', type: 'uuid', nullable: true })
  voucherId: string | null;

  @Column({ name: 'voucher_code', type: 'varchar', length: 50, nullable: true })
  voucherCode: string | null;

  @Column({ name: 'shipping_address', type: 'jsonb' })
  shippingAddress: Record<string, any>;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress: Record<string, any> | null;

  @Column({ name: 'shipping_method', type: 'varchar', length: 100, nullable: true })
  shippingMethod: string | null;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: string | null;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes: string | null;

  @Column({ name: 'seller_notes', type: 'text', nullable: true })
  sellerNotes: string | null;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string | null;

  @Column({ name: 'is_gift', type: 'boolean', default: false })
  isGift: boolean;

  @Column({ name: 'gift_message', type: 'varchar', length: 500, nullable: true })
  giftMessage: string | null;

  @Column({ name: 'gift_wrap_requested', type: 'boolean', default: false })
  giftWrapRequested: boolean;

  @Column({ name: 'loyalty_points_earned', type: 'integer', default: 0 })
  loyaltyPointsEarned: number;

  @Column({ name: 'loyalty_points_used', type: 'integer', default: 0 })
  loyaltyPointsUsed: number;

  @Column({ name: 'loyalty_discount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  loyaltyDiscount: number;

  @Column({ name: 'estimated_delivery_date', type: 'date', nullable: true })
  estimatedDeliveryDate: Date | null;

  @Column({ name: 'actual_delivery_date', type: 'date', nullable: true })
  actualDeliveryDate: Date | null;

  @Column({ name: 'source_platform', type: 'varchar', length: 50, default: 'web' })
  sourcePlatform: string;

  @Column({ name: 'device_type', type: 'varchar', length: 20, nullable: true })
  deviceType: string | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'placed_at', type: 'timestamptz', nullable: true })
  placedAt: Date | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory: OrderStatusHistory[];

  @OneToMany(() => Shipment, (shipment) => shipment.order)
  shipments: Shipment[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
