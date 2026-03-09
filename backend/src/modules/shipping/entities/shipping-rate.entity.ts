import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ShippingRateType } from '@common/enums';
import { ShippingMethod } from './shipping-method.entity';
import { ShippingZone } from './shipping-zone.entity';

@Entity('shipping_rates')
@Unique(['shippingMethodId', 'shippingZoneId'])
export class ShippingRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipping_method_id', type: 'uuid' })
  shippingMethodId: string;

  @ManyToOne(() => ShippingMethod, (method) => method.rates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod: ShippingMethod;

  @Column({ name: 'shipping_zone_id', type: 'uuid' })
  shippingZoneId: string;

  @ManyToOne(() => ShippingZone, (zone) => zone.rates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipping_zone_id' })
  shippingZone: ShippingZone;

  @Column({
    name: 'rate_type',
    type: 'enum',
    enum: ShippingRateType,
    default: ShippingRateType.FLAT,
  })
  rateType: ShippingRateType;

  @Column({ name: 'base_rate', type: 'decimal', precision: 12, scale: 2 })
  baseRate: number;

  @Column({
    name: 'per_kg_rate',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  perKgRate: number | null;

  @Column({
    name: 'per_item_rate',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  perItemRate: number | null;

  @Column({
    name: 'min_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  minOrderAmount: number | null;

  @Column({
    name: 'max_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maxOrderAmount: number | null;

  @Column({
    name: 'free_shipping_threshold',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  freeShippingThreshold: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
