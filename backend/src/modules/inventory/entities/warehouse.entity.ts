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
import { Seller } from '../../sellers/entities/seller.entity';
import { Inventory } from './inventory.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId: string | null;

  @ManyToOne(() => Seller)
  @JoinColumn({ name: 'seller_id' })
  seller: Seller | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ name: 'address_line1', type: 'varchar', length: 200, nullable: true })
  addressLine1: string | null;

  @Column({ name: 'address_line2', type: 'varchar', length: 200, nullable: true })
  addressLine2: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string | null;

  @Column({ name: 'country_code', type: 'varchar', length: 3, default: 'PK' })
  countryCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ name: 'contact_name', type: 'varchar', length: 100, nullable: true })
  contactName: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true })
  contactPhone: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 150, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'integer', default: 0 })
  priority: number;

  @OneToMany(() => Inventory, (inv) => inv.warehouse)
  inventory: Inventory[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
