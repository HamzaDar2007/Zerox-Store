import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { TaxRate } from './tax-rate.entity';

@Entity('order_tax_lines')
export class OrderTaxLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'tax_rate_id', type: 'uuid', nullable: true })
  taxRateId: string | null;

  @ManyToOne(() => TaxRate)
  @JoinColumn({ name: 'tax_rate_id' })
  taxRate: TaxRate | null;

  @Column({ name: 'tax_name', type: 'varchar', length: 100 })
  taxName: string;

  @Column({ name: 'tax_rate_value', type: 'decimal', precision: 5, scale: 2 })
  taxRateValue: number;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 12, scale: 2 })
  taxableAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2 })
  taxAmount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
