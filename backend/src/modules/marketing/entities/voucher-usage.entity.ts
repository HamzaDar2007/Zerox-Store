import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('voucher_usages')
export class VoucherUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voucher_id', type: 'uuid' })
  voucherId: string;

  @ManyToOne(() => Voucher, (voucher) => voucher.usages)
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    name: 'discount_applied',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  discountApplied: number;

  @Column({ name: 'used_at', type: 'timestamptz', default: () => 'NOW()' })
  usedAt: Date;
}
