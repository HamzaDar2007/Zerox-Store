import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { FlashSale } from './flash-sale.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('flash_sale_items')
@Unique(['flashSaleId', 'variantId'])
export class FlashSaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'flash_sale_id', type: 'uuid' })
  flashSaleId: string;

  @ManyToOne(() => FlashSale, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flash_sale_id' })
  flashSale: FlashSale;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ name: 'sale_price', type: 'numeric', precision: 14, scale: 4 })
  salePrice: number;

  @Column({ name: 'quantity_limit', type: 'int', nullable: true })
  quantityLimit: number | null;

  @Column({ name: 'quantity_sold', type: 'int', nullable: true })
  quantitySold: number | null;
}
