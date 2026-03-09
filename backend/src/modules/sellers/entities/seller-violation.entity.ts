import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ViolationSeverity, ViolationPenalty } from '@common/enums';
import { Seller } from './seller.entity';
import { User } from '../../users/entities/user.entity';

@Entity('seller_violations')
export class SellerViolation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => Seller, (seller) => seller.violations)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller;

  @Column({ name: 'violation_type', type: 'varchar', length: 100 })
  violationType: string;

  @Column({
    type: 'enum',
    enum: ViolationSeverity,
    default: ViolationSeverity.WARNING,
  })
  severity: ViolationSeverity;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'evidence_urls', type: 'jsonb', nullable: true })
  evidenceUrls: string[] | null;

  @Column({
    name: 'penalty_action',
    type: 'enum',
    enum: ViolationPenalty,
    nullable: true,
  })
  penaltyAction: ViolationPenalty | null;

  @Column({
    name: 'fine_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  fineAmount: number | null;

  @Column({ name: 'issued_by', type: 'uuid', nullable: true })
  issuedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issued_by' })
  issuer: User;

  @Column({ name: 'appealed_at', type: 'timestamptz', nullable: true })
  appealedAt: Date | null;

  @Column({ name: 'appeal_note', type: 'text', nullable: true })
  appealNote: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
