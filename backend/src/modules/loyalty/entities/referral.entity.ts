import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReferralStatus } from '@common/enums';
import { User } from '../../users/entities/user.entity';
import { ReferralCode } from './referral-code.entity';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'referrer_user_id', type: 'uuid' })
  referrerUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referrer_user_id' })
  referrerUser: User;

  @Column({ name: 'referred_user_id', type: 'uuid', unique: true })
  referredUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referred_user_id' })
  referredUser: User;

  @Column({ name: 'referral_code_id', type: 'uuid' })
  referralCodeId: string;

  @ManyToOne(() => ReferralCode)
  @JoinColumn({ name: 'referral_code_id' })
  referralCode: ReferralCode;

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

  @Column({ name: 'points_awarded', type: 'integer', default: 0 })
  pointsAwarded: number;

  @Column({ name: 'rewarded_at', type: 'timestamptz', nullable: true })
  rewardedAt: Date | null;

  @Column({ name: 'qualified_at', type: 'timestamptz', nullable: true })
  qualifiedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
