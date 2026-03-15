import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'discount_type', type: 'varchar', length: 20 })
  discountType: string;

  @Column({ name: 'discount_value', type: 'numeric', precision: 14, scale: 4 })
  discountValue: number;

  @Column({
    name: 'max_discount',
    type: 'numeric',
    precision: 14,
    scale: 4,
    nullable: true,
  })
  maxDiscount: number | null;

  @Column({
    name: 'min_order_value',
    type: 'numeric',
    precision: 14,
    scale: 4,
    nullable: true,
  })
  minOrderValue: number | null;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'per_user_limit', type: 'int', nullable: true })
  perUserLimit: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;
}
