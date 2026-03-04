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
import { VoucherType } from '@common/enums';
import { Seller } from '../../sellers/entities/seller.entity';
import { BundleItem } from './bundle-item.entity';

@Entity('product_bundles')
export class ProductBundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: VoucherType,
    default: VoucherType.PERCENTAGE,
  })
  discountType: VoucherType;

  @Column({
    name: 'discount_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  discountValue: number;

  @Column({
    name: 'bundle_price',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  bundlePrice: number | null;

  @Column({
    name: 'original_total_price',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  originalTotalPrice: number | null;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId: string | null;

  @ManyToOne(() => Seller)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller | null;

  @OneToMany(() => BundleItem, (item) => item.bundle)
  items: BundleItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
