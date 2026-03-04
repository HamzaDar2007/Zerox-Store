import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';

@Entity('voucher_conditions')
export class VoucherCondition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voucher_id', type: 'uuid' })
  voucherId: string;

  @ManyToOne(() => Voucher, (voucher) => voucher.conditions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @Column({ name: 'condition_type', type: 'varchar', length: 50 })
  conditionType: string;

  @Column({ name: 'condition_value', type: 'jsonb' })
  conditionValue: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
