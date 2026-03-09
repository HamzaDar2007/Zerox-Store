import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ProductBundle } from './product-bundle.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('bundle_items')
@Unique(['bundleId', 'productId', 'variantId'])
export class BundleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bundle_id', type: 'uuid' })
  bundleId: string;

  @ManyToOne(() => ProductBundle, (bundle) => bundle.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle: ProductBundle;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;
}
