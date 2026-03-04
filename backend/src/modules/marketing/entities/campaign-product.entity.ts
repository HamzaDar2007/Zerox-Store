import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('campaign_products')
@Unique(['campaignId', 'productId'])
export class CampaignProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'sale_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salePrice: number | null;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage: number | null;

  @Column({ name: 'stock_limit', type: 'integer', nullable: true })
  stockLimit: number | null;

  @Column({ name: 'sold_count', type: 'integer', default: 0 })
  soldCount: number;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;
}
