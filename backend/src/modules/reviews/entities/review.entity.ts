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
import { ReviewStatus } from '@common/enums';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { ReviewHelpfulness } from './review-helpfulness.entity';
import { ReviewReport } from './review-report.entity';

@Entity('reviews')
@Unique(['userId', 'productId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order | null;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  pros: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  cons: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ name: 'is_verified_purchase', type: 'boolean', default: false })
  isVerifiedPurchase: boolean;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ name: 'helpful_count', type: 'integer', default: 0 })
  helpfulCount: number;

  @Column({ name: 'not_helpful_count', type: 'integer', default: 0 })
  notHelpfulCount: number;

  @Column({ name: 'seller_response', type: 'text', nullable: true })
  sellerResponse: string | null;

  @Column({ name: 'seller_response_at', type: 'timestamptz', nullable: true })
  sellerResponseAt: Date | null;

  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'moderated_by' })
  moderatedByUser: User | null;

  @Column({ name: 'moderated_at', type: 'timestamptz', nullable: true })
  moderatedAt: Date | null;

  @Column({ name: 'moderation_notes', type: 'text', nullable: true })
  moderationNotes: string | null;

  @OneToMany(() => ReviewHelpfulness, (helpfulness) => helpfulness.review)
  helpfulness: ReviewHelpfulness[];

  @OneToMany(() => ReviewReport, (report) => report.review)
  reports: ReviewReport[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
