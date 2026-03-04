import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductQuestion } from './product-question.entity';
import { User } from '../../users/entities/user.entity';
import { Seller } from '../../sellers/entities/seller.entity';

@Entity('product_answers')
export class ProductAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @ManyToOne(() => ProductQuestion, (q) => q.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: ProductQuestion;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId: string | null;

  @ManyToOne(() => Seller)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller | null;

  @Column({ name: 'answer_text', type: 'text' })
  answerText: string;

  @Column({ name: 'is_seller_answer', type: 'boolean', default: false })
  isSellerAnswer: boolean;

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ name: 'upvote_count', type: 'integer', default: 0 })
  upvoteCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
