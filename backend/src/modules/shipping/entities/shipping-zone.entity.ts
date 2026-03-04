import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ShippingRate } from './shipping-rate.entity';

@Entity('shipping_zones')
export class ShippingZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 2, array: true, default: '{}' })
  countries: string[];

  @Column({ type: 'varchar', length: 100, array: true, default: '{}' })
  states: string[];

  @Column({ type: 'varchar', length: 20, array: true, default: '{}' })
  postcodes: string[];

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @OneToMany(() => ShippingRate, (rate) => rate.shippingZone)
  rates: ShippingRate[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
