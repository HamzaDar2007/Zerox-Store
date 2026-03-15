import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Coupon } from '../../cart/entities/coupon.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string | null;

  @ManyToOne(() => Coupon, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @Column({ type: 'varchar', length: 30 })
  status: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 14, scale: 4 })
  discountAmount: number;

  @Column({ name: 'shipping_amount', type: 'numeric', precision: 14, scale: 4 })
  shippingAmount: number;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 14, scale: 4 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 14, scale: 4 })
  totalAmount: number;

  @Column({ name: 'shipping_line1', type: 'text', nullable: true })
  shippingLine1: string | null;

  @Column({ name: 'shipping_line2', type: 'text', nullable: true })
  shippingLine2: string | null;

  @Column({
    name: 'shipping_city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  shippingCity: string | null;

  @Column({
    name: 'shipping_state',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  shippingState: string | null;

  @Column({
    name: 'shipping_postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  shippingPostalCode: string | null;

  @Column({ name: 'shipping_country', type: 'char', length: 2, nullable: true })
  shippingCountry: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
