import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Return } from './return.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'return_id', type: 'uuid' })
  returnId: string;

  @ManyToOne(() => Return, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_id' })
  return: Return;

  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId: string;

  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condition: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
