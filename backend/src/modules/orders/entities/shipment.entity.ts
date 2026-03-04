import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ShipmentStatus } from '@common/enums';
import { Order } from './order.entity';
import { ShipmentItem } from './shipment-item.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.shipments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'shipment_number', type: 'varchar', length: 50, unique: true })
  shipmentNumber: string;

  @Column({ name: 'carrier_id', type: 'uuid', nullable: true })
  carrierId: string | null;

  @Column({ name: 'carrier_name', type: 'varchar', length: 100, nullable: true })
  carrierName: string | null;

  @Column({ name: 'tracking_number', type: 'varchar', length: 100, nullable: true })
  trackingNumber: string | null;

  @Column({ name: 'tracking_url', type: 'text', nullable: true })
  trackingUrl: string | null;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ name: 'shipping_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 10, scale: 3, nullable: true })
  weightKg: number | null;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: Record<string, any> | null;

  @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'estimated_delivery_at', type: 'timestamptz', nullable: true })
  estimatedDeliveryAt: Date | null;

  @Column({ name: 'delivery_address', type: 'jsonb' })
  deliveryAddress: Record<string, any>;

  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @OneToMany(() => ShipmentItem, (item) => item.shipment)
  items: ShipmentItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
