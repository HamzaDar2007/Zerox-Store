import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('saved_payment_methods')
export class SavedPaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'payment_method',
    nullable: true,
  })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({
    name: 'gateway_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  gatewayToken: string | null;

  @Column({
    name: 'card_last_four',
    type: 'varchar',
    length: 4,
    nullable: true,
  })
  cardLastFour: string | null;

  @Column({ name: 'card_brand', type: 'varchar', length: 20, nullable: true })
  cardBrand: string | null;

  @Column({ name: 'card_expiry_month', type: 'integer', nullable: true })
  cardExpiryMonth: number | null;

  @Column({ name: 'card_expiry_year', type: 'integer', nullable: true })
  cardExpiryYear: number | null;

  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({
    name: 'account_last_four',
    type: 'varchar',
    length: 4,
    nullable: true,
  })
  accountLastFour: string | null;

  @Column({
    name: 'wallet_provider',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  walletProvider: string | null;

  @Column({ name: 'wallet_id', type: 'varchar', length: 255, nullable: true })
  walletId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
