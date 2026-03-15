import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShippingZone } from './shipping-zone.entity';

@Entity('shipping_methods')
export class ShippingMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'zone_id', type: 'uuid' })
  zoneId: string;

  @ManyToOne(() => ShippingZone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: ShippingZone;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  carrier: string | null;

  @Column({ name: 'estimated_days_min', type: 'int', nullable: true })
  estimatedDaysMin: number | null;

  @Column({ name: 'estimated_days_max', type: 'int', nullable: true })
  estimatedDaysMax: number | null;

  @Column({ name: 'base_rate', type: 'numeric', precision: 14, scale: 4 })
  baseRate: number;

  @Column({ name: 'per_kg_rate', type: 'numeric', precision: 14, scale: 4 })
  perKgRate: number;

  @Column({
    name: 'free_threshold',
    type: 'numeric',
    precision: 14,
    scale: 4,
    nullable: true,
  })
  freeThreshold: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
