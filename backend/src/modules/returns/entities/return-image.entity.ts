import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReturnRequest } from './return-request.entity';

@Entity('return_images')
export class ReturnImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'return_request_id', type: 'uuid' })
  returnRequestId: string;

  @ManyToOne(() => ReturnRequest, (request) => request.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'return_request_id' })
  returnRequest: ReturnRequest;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
