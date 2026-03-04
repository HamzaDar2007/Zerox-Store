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
import { Seller } from './seller.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('seller_wallets')
export class SellerWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id', type: 'uuid', unique: true })
  sellerId: string;

  @OneToOne(() => Seller, (seller) => seller.wallet)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0.0 })
  balance: number;

  @Column({ name: 'pending_balance', type: 'decimal', precision: 14, scale: 2, default: 0.0 })
  pendingBalance: number;

  @Column({ name: 'total_earned', type: 'decimal', precision: 16, scale: 2, default: 0.0 })
  totalEarned: number;

  @Column({ name: 'total_withdrawn', type: 'decimal', precision: 16, scale: 2, default: 0.0 })
  totalWithdrawn: number;

  @Column({ name: 'currency_code', type: 'varchar', length: 3, default: 'PKR' })
  currencyCode: string;

  @OneToMany(() => WalletTransaction, (tx) => tx.wallet)
  transactions: WalletTransaction[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
