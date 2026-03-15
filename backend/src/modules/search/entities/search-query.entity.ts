import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('search_queries')
export class SearchQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'session_id', type: 'varchar', length: 200, nullable: true })
  sessionId: string | null;

  @Column({ type: 'text' })
  query: string;

  @Column({ name: 'result_count', type: 'int', nullable: true })
  resultCount: number | null;

  @Column({ name: 'clicked_product', type: 'uuid', nullable: true })
  clickedProduct: string | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clicked_product' })
  clickedProductEntity: Product | null;

  @Column({ name: 'searched_at', type: 'timestamptz', default: () => 'NOW()' })
  searchedAt: Date;
}
