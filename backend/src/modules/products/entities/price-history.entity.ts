import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('price_history')
export class PriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'old_price', type: 'decimal', precision: 12, scale: 2 })
  oldPrice: number;

  @Column({ name: 'new_price', type: 'decimal', precision: 12, scale: 2 })
  newPrice: number;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User | null;

  @Column({ name: 'change_reason', type: 'varchar', length: 200, nullable: true })
  changeReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
