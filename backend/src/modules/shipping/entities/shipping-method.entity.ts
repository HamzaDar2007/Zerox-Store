import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ShippingRate } from './shipping-rate.entity';

@Entity('shipping_methods')
export class ShippingMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['standard', 'express', 'same_day', 'overnight', 'economy', 'freight'], default: 'standard' })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'estimated_days_min', type: 'integer', nullable: true })
  estimatedDaysMin: number | null;

  @Column({ name: 'estimated_days_max', type: 'integer', nullable: true })
  estimatedDaysMax: number | null;

  @OneToMany(() => ShippingRate, (rate) => rate.shippingMethod)
  rates: ShippingRate[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;
}
