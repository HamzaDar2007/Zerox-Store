import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InventoryTransfer } from './inventory-transfer.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('inventory_transfer_items')
export class InventoryTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_id', type: 'uuid' })
  transferId: string;

  @ManyToOne(() => InventoryTransfer, (transfer) => transfer.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transfer_id' })
  transfer: InventoryTransfer;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_variant_id', type: 'uuid', nullable: true })
  productVariantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant | null;

  @Column({ name: 'quantity_requested', type: 'integer' })
  quantityRequested: number;

  @Column({ name: 'quantity_shipped', type: 'integer', nullable: true })
  quantityShipped: number | null;

  @Column({ name: 'quantity_received', type: 'integer', nullable: true })
  quantityReceived: number | null;
}
