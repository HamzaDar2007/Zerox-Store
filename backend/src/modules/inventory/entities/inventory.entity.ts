import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Warehouse } from './warehouse.entity';
import { StockMovement } from './stock-movement.entity';

@Entity('inventory')
@Unique(['productId', 'productVariantId', 'warehouseId'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, (wh) => wh.inventory)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'quantity_on_hand', type: 'integer', default: 0 })
  quantityOnHand: number;

  @Column({ name: 'quantity_reserved', type: 'integer', default: 0 })
  quantityReserved: number;

  @Column({ name: 'quantity_available', type: 'integer', default: 0 })
  quantityAvailable: number;

  @Column({ name: 'low_stock_threshold', type: 'integer', default: 10 })
  lowStockThreshold: number;

  @Column({ name: 'reorder_point', type: 'integer', nullable: true })
  reorderPoint: number | null;

  @Column({ name: 'reorder_quantity', type: 'integer', nullable: true })
  reorderQuantity: number | null;

  @Column({ name: 'last_restocked_at', type: 'timestamptz', nullable: true })
  lastRestockedAt: Date | null;

  @OneToMany(() => StockMovement, (movement) => movement.inventory)
  movements: StockMovement[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
