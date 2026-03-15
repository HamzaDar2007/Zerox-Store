import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Store } from '../../sellers/entities/store.entity';
import { FlashSale } from '../../cart/entities/flash-sale.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'sku_snapshot', type: 'varchar', length: 200 })
  skuSnapshot: string;

  @Column({ name: 'name_snapshot', type: 'varchar', length: 300 })
  nameSnapshot: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 14, scale: 4 })
  unitPrice: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 14, scale: 4 })
  discountAmount: number;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 14, scale: 4 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 14, scale: 4 })
  totalAmount: number;

  @Column({ name: 'flash_sale_id', type: 'uuid', nullable: true })
  flashSaleId: string | null;

  @ManyToOne(() => FlashSale, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'flash_sale_id' })
  flashSale: FlashSale | null;
}
