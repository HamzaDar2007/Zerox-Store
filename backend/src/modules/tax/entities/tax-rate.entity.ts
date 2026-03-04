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
import { TaxClass } from './tax-class.entity';
import { TaxZone } from './tax-zone.entity';

@Entity('tax_rates')
@Unique(['taxClassId', 'taxZoneId'])
export class TaxRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tax_class_id', type: 'uuid' })
  taxClassId: string;

  @ManyToOne(() => TaxClass, (taxClass) => taxClass.rates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tax_class_id' })
  taxClass: TaxClass;

  @Column({ name: 'tax_zone_id', type: 'uuid' })
  taxZoneId: string;

  @ManyToOne(() => TaxZone, (taxZone) => taxZone.rates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tax_zone_id' })
  taxZone: TaxZone;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number;

  @Column({ type: 'integer', default: 0 })
  priority: number;

  @Column({ name: 'is_compound', type: 'boolean', default: false })
  isCompound: boolean;

  @Column({ name: 'is_shipping', type: 'boolean', default: false })
  isShipping: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
