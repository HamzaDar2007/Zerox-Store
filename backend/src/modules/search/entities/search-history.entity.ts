import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('search_history')
@Index(['userId', 'createdAt'])
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId: string | null;

  @Column({ name: 'search_query', type: 'varchar', length: 255 })
  searchQuery: string;

  @Column({ name: 'results_count', type: 'integer', default: 0 })
  resultsCount: number;

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any> | null;

  @Column({ name: 'clicked_product_id', type: 'uuid', nullable: true })
  clickedProductId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
