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
import { VoucherType, VoucherScope } from '@common/enums';
import { Seller } from '../../sellers/entities/seller.entity';
import { VoucherCondition } from './voucher-condition.entity';
import { VoucherProduct } from './voucher-product.entity';
import { VoucherUsage } from './voucher-usage.entity';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId: string | null;

  @ManyToOne(() => Seller)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller | null;

  @Column({
    type: 'enum',
    enum: VoucherType,
  })
  type: VoucherType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 12, scale: 2 })
  discountValue: number;

  @Column({
    name: 'min_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  minOrderAmount: number;

  @Column({
    name: 'max_discount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maxDiscount: number | null;

  @Column({
    name: 'applicable_to',
    type: 'enum',
    enum: VoucherScope,
    default: VoucherScope.ALL,
  })
  applicableTo: VoucherScope;

  @Column({ name: 'applicable_ids', type: 'jsonb', nullable: true })
  applicableIds: Record<string, any> | null;

  @Column({ name: 'total_limit', type: 'integer', nullable: true })
  totalLimit: number | null;

  @Column({ name: 'per_user_limit', type: 'integer', default: 1 })
  perUserLimit: number;

  @Column({ name: 'used_count', type: 'integer', default: 0 })
  usedCount: number;

  @Column({ name: 'first_order_only', type: 'boolean', default: false })
  firstOrderOnly: boolean;

  @Column({ type: 'boolean', default: false })
  stackable: boolean;

  @Column({ name: 'display_on_store', type: 'boolean', default: true })
  displayOnStore: boolean;

  @Column({ name: 'currency_code', type: 'varchar', length: 3, default: 'PKR' })
  currencyCode: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => VoucherCondition, (condition) => condition.voucher)
  conditions: VoucherCondition[];

  @OneToMany(() => VoucherProduct, (product) => product.voucher)
  products: VoucherProduct[];

  @OneToMany(() => VoucherUsage, (usage) => usage.voucher)
  usages: VoucherUsage[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
