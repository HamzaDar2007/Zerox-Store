import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { VerificationStatus, PayoutFrequency } from '@common/enums';
import { User } from '../../users/entities/user.entity';
import { Store } from './store.entity';
import { SellerWallet } from './seller-wallet.entity';
import { SellerDocument } from './seller-document.entity';
import { SellerViolation } from './seller-violation.entity';

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'business_name', type: 'varchar', length: 200 })
  businessName: string;

  @Column({
    name: 'business_name_ar',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  businessNameAr: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  cnic: string | null;

  @Column({
    name: 'cnic_front_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  cnicFrontImage: string | null;

  @Column({
    name: 'cnic_back_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  cnicBackImage: string | null;

  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({
    name: 'bank_account_number',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  bankAccountNumber: string | null;

  @Column({
    name: 'bank_account_title',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  bankAccountTitle: string | null;

  @Column({ name: 'bank_iban', type: 'varchar', length: 34, nullable: true })
  bankIban: string | null;

  @Column({ name: 'bank_swift', type: 'varchar', length: 11, nullable: true })
  bankSwift: string | null;

  @Column({
    name: 'payout_frequency',
    type: 'enum',
    enum: PayoutFrequency,
    default: PayoutFrequency.WEEKLY,
  })
  payoutFrequency: PayoutFrequency;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 10.0,
  })
  commissionRate: number;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'suspension_reason', type: 'text', nullable: true })
  suspensionReason: string | null;

  @Column({ name: 'suspended_at', type: 'timestamptz', nullable: true })
  suspendedAt: Date | null;

  @Column({ name: 'vacation_mode', type: 'boolean', default: false })
  vacationMode: boolean;

  @Column({ name: 'vacation_start_date', type: 'date', nullable: true })
  vacationStartDate: Date | null;

  @Column({ name: 'vacation_end_date', type: 'date', nullable: true })
  vacationEndDate: Date | null;

  @Column({ name: 'avg_response_time', type: 'interval', nullable: true })
  avgResponseTime: string | null;

  @Column({ name: 'total_products', type: 'integer', default: 0 })
  totalProducts: number;

  @Column({ name: 'total_orders', type: 'integer', default: 0 })
  totalOrders: number;

  @Column({
    name: 'total_revenue',
    type: 'decimal',
    precision: 16,
    scale: 2,
    default: 0,
  })
  totalRevenue: number;

  @OneToMany(() => Store, (store) => store.seller)
  stores: Store[];

  @OneToOne(() => SellerWallet, (wallet) => wallet.seller)
  wallet: SellerWallet;

  @OneToMany(() => SellerDocument, (doc) => doc.seller)
  documents: SellerDocument[];

  @OneToMany(() => SellerViolation, (violation) => violation.seller)
  violations: SellerViolation[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
