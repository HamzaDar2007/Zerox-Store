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
import { SubscriptionStatus, SubscriptionFrequency } from '@common/enums';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Address } from '../../users/entities/address.entity';
import { SavedPaymentMethod } from '../../payments/entities/saved-payment-method.entity';
import { SubscriptionOrder } from './subscription-order.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: SubscriptionFrequency,
  })
  frequency: SubscriptionFrequency;

  @Column({ name: 'delivery_address_id', type: 'uuid' })
  deliveryAddressId: string;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress: Address;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId: string | null;

  @ManyToOne(() => SavedPaymentMethod)
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: SavedPaymentMethod | null;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitPrice: number;

  @Column({
    name: 'discount_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  discountPercentage: number;

  @Column({ name: 'next_delivery_date', type: 'date' })
  nextDeliveryDate: Date;

  @Column({ name: 'last_order_date', type: 'date', nullable: true })
  lastOrderDate: Date | null;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ name: 'paused_at', type: 'timestamptz', nullable: true })
  pausedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'total_orders', type: 'integer', default: 0 })
  totalOrders: number;

  @Column({
    name: 'total_spent',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  totalSpent: number;

  @Column({ name: 'stripe_subscription_id', type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 255, nullable: true })
  stripeCustomerId: string | null;

  @Column({ name: 'stripe_price_id', type: 'varchar', length: 255, nullable: true })
  stripePriceId: string | null;

  @OneToMany(() => SubscriptionOrder, (order) => order.subscription)
  subscriptionOrders: SubscriptionOrder[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
