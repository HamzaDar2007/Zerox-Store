import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WalletTransactionType } from '@common/enums';
import { SellerWallet } from './seller-wallet.entity';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @ManyToOne(() => SellerWallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: SellerWallet;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({
    type: 'enum',
    enum: WalletTransactionType,
  })
  type: WalletTransactionType;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  commissionAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 14, scale: 2 })
  netAmount: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 14, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
