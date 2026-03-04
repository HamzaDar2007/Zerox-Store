import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecommendationType } from '@common/enums';
import { Product } from '../../products/entities/product.entity';

@Entity('product_recommendations')
export class ProductRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_product_id', type: 'uuid' })
  sourceProductId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_product_id' })
  sourceProduct: Product;

  @Column({ name: 'recommended_product_id', type: 'uuid' })
  recommendedProductId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommended_product_id' })
  recommendedProduct: Product;

  @Column({
    type: 'enum',
    enum: RecommendationType,
  })
  type: RecommendationType;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  score: number;

  @Column({ name: 'is_manual', type: 'boolean', default: false })
  isManual: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
