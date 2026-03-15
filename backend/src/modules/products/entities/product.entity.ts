import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from '../../sellers/entities/store.entity';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../categories/entities/brand.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @ManyToOne(() => Brand, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ name: 'short_desc', type: 'text', nullable: true })
  shortDesc: string | null;

  @Column({ name: 'full_desc', type: 'text', nullable: true })
  fullDesc: string | null;

  @Column({ name: 'base_price', type: 'numeric', precision: 14, scale: 4 })
  basePrice: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'is_active', type: 'boolean', nullable: true })
  isActive: boolean | null;

  @Column({ name: 'is_digital', type: 'boolean', nullable: true })
  isDigital: boolean | null;

  @Column({ name: 'requires_shipping', type: 'boolean', nullable: true })
  requiresShipping: boolean | null;

  @Column({ name: 'tax_class', type: 'varchar', length: 50, nullable: true })
  taxClass: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
