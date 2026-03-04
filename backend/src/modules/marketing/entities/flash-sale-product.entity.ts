import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { FlashSale } from './flash-sale.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('flash_sale_products')
@Unique(['flashSaleId', 'productId'])
export class FlashSaleProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'flash_sale_id', type: 'uuid' })
  flashSaleId: string;

  @ManyToOne(() => FlashSale, (sale) => sale.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flash_sale_id' })
  flashSale: FlashSale;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string | null;

  @Column({ name: 'sale_price', type: 'decimal', precision: 12, scale: 2 })
  salePrice: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 12, scale: 2 })
  originalPrice: number;

  @Column({ name: 'stock_limit', type: 'integer' })
  stockLimit: number;

  @Column({ name: 'sold_count', type: 'integer', default: 0 })
  soldCount: number;

  @Column({ name: 'per_user_limit', type: 'integer', default: 1 })
  perUserLimit: number;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;
}
