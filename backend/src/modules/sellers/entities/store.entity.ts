import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Seller } from './seller.entity';
import { StoreFollower } from './store-follower.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => Seller, (seller) => seller.stores)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'banner_url', type: 'varchar', length: 500, nullable: true })
  bannerUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'return_policy', type: 'text', nullable: true })
  returnPolicy: string | null;

  @Column({ name: 'shipping_policy', type: 'text', nullable: true })
  shippingPolicy: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number;

  @Column({ name: 'total_reviews', type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_sales', type: 'integer', default: 0 })
  totalSales: number;

  @Column({ name: 'total_followers', type: 'integer', default: 0 })
  totalFollowers: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @OneToMany(() => StoreFollower, (follower) => follower.store)
  followers: StoreFollower[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
