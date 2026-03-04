import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReturnShipmentStatus, ReturnShipmentDirection } from '@common/enums';
import { ReturnRequest } from './return-request.entity';

@Entity('return_shipments')
export class ReturnShipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'return_request_id', type: 'uuid' })
  returnRequestId: string;

  @ManyToOne(() => ReturnRequest, (request) => request.shipments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_request_id' })
  returnRequest: ReturnRequest;

  @Column({
    type: 'enum',
    enum: ReturnShipmentDirection,
  })
  direction: ReturnShipmentDirection;

  @Column({ name: 'carrier_name', type: 'varchar', length: 100, nullable: true })
  carrierName: string | null;

  @Column({ name: 'tracking_number', type: 'varchar', length: 100, nullable: true })
  trackingNumber: string | null;

  @Column({ name: 'tracking_url', type: 'text', nullable: true })
  trackingUrl: string | null;

  @Column({
    type: 'enum',
    enum: ReturnShipmentStatus,
    default: ReturnShipmentStatus.PENDING,
  })
  status: ReturnShipmentStatus;

  @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
