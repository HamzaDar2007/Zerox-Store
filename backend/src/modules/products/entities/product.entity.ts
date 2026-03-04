import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductStatus, WarrantyType } from '@common/enums';
import { Seller } from '../../sellers/entities/seller.entity';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../categories/entities/brand.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { ProductAttribute } from './product-attribute.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => Seller)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ name: 'compare_at_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  compareAtPrice: number | null;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice: number | null;

  @Column({ name: 'currency_code', type: 'varchar', length: 3, default: 'PKR' })
  currencyCode: string;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ name: 'low_stock_threshold', type: 'integer', default: 5 })
  lowStockThreshold: number;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number | null;

  @Column({ name: 'weight_unit', type: 'varchar', length: 10, default: 'kg' })
  weightUnit: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number | null;

  @Column({ name: 'dimension_unit', type: 'varchar', length: 10, default: 'cm' })
  dimensionUnit: string;

  @Column({
    name: 'warranty_type',
    type: 'enum',
    enum: WarrantyType,
    nullable: true,
  })
  warrantyType: WarrantyType | null;

  @Column({ name: 'warranty_duration_months', type: 'smallint', nullable: true })
  warrantyDurationMonths: number | null;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_digital', type: 'boolean', default: false })
  isDigital: boolean;

  @Column({ name: 'requires_shipping', type: 'boolean', default: true })
  requiresShipping: boolean;

  @Column({ name: 'is_taxable', type: 'boolean', default: true })
  isTaxable: boolean;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ name: 'total_reviews', type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_sales', type: 'integer', default: 0 })
  totalSales: number;

  @Column({ name: 'view_count', type: 'integer', default: 0 })
  viewCount: number;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductAttribute, (attr) => attr.product)
  attributes: ProductAttribute[];

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
