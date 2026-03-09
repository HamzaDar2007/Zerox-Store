import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  compareAtPrice: number | null;

  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  costPrice: number | null;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number | null;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, string> | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
