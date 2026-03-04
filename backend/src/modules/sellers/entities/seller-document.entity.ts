import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SellerDocType, DocStatus } from '@common/enums';
import { Seller } from './seller.entity';
import { User } from '../../users/entities/user.entity';

@Entity('seller_documents')
export class SellerDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => Seller, (seller) => seller.documents)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: SellerDocType,
  })
  documentType: SellerDocType;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: DocStatus,
    default: DocStatus.PENDING,
  })
  status: DocStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
