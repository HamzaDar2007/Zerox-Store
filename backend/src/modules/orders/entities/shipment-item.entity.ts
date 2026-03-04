import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';
import { OrderItem } from './order-item.entity';

@Entity('shipment_items')
export class ShipmentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipment_id', type: 'uuid' })
  shipmentId: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId: string;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ type: 'integer' })
  quantity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
