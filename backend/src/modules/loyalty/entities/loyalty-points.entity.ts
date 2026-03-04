import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoyaltyTier } from './loyalty-tier.entity';

@Entity('loyalty_points')
export class LoyaltyPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'tier_id', type: 'uuid', nullable: true })
  tierId: string | null;

  @ManyToOne(() => LoyaltyTier)
  @JoinColumn({ name: 'tier_id' })
  tier: LoyaltyTier | null;

  @Column({ name: 'total_earned', type: 'integer', default: 0 })
  totalEarned: number;

  @Column({ name: 'total_redeemed', type: 'integer', default: 0 })
  totalRedeemed: number;

  @Column({ name: 'total_expired', type: 'integer', default: 0 })
  totalExpired: number;

  @Column({ name: 'available_balance', type: 'integer', default: 0 })
  availableBalance: number;

  @Column({ name: 'lifetime_points', type: 'integer', default: 0 })
  lifetimePoints: number;

  @Column({ name: 'tier_recalculated_at', type: 'timestamptz', nullable: true })
  tierRecalculatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
