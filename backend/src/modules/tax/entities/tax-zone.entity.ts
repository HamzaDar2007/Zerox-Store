import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { TaxRate } from './tax-rate.entity';

@Entity('tax_zones')
export class TaxZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'country_code', type: 'varchar', length: 3 })
  countryCode: string;

  @Column({ name: 'state_code', type: 'varchar', length: 10, nullable: true })
  stateCode: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'postal_code_pattern', type: 'varchar', length: 50, nullable: true })
  postalCodePattern: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => TaxRate, (rate) => rate.taxZone)
  rates: TaxRate[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
