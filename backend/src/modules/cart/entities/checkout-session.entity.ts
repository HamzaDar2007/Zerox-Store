import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CheckoutStep } from '@common/enums';
import { User } from '../../users/entities/user.entity';
import { Cart } from './cart.entity';

@Entity('checkout_sessions')
export class CheckoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'session_token', type: 'varchar', length: 255, unique: true })
  sessionToken: string;

  @Column({
    type: 'enum',
    enum: CheckoutStep,
    default: CheckoutStep.CART_REVIEW,
  })
  step: CheckoutStep;

  @Column({ name: 'shipping_address_id', type: 'uuid', nullable: true })
  shippingAddressId: string | null;

  @Column({ name: 'billing_address_id', type: 'uuid', nullable: true })
  billingAddressId: string | null;

  @Column({ name: 'shipping_method_id', type: 'uuid', nullable: true })
  shippingMethodId: string | null;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod: string | null;

  @Column({ name: 'cart_snapshot', type: 'jsonb', nullable: true })
  cartSnapshot: Record<string, any> | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Column({
    name: 'shipping_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingAmount: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Column({ name: 'loyalty_points_used', type: 'integer', default: 0 })
  loyaltyPointsUsed: number;

  @Column({
    name: 'loyalty_discount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  loyaltyDiscount: number;

  @Column({ name: 'gift_wrap_requested', type: 'boolean', default: false })
  giftWrapRequested: boolean;

  @Column({
    name: 'gift_message',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  giftMessage: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 20, nullable: true })
  deviceType: string | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
