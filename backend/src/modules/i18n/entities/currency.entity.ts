import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CurrencyRateHistory } from './currency-rate-history.entity';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 3, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({
    name: 'symbol_position',
    type: 'varchar',
    length: 10,
    default: 'before',
  })
  symbolPosition: string;

  @Column({ name: 'decimal_places', type: 'smallint', default: 2 })
  decimalPlaces: number;

  @Column({
    name: 'thousands_separator',
    type: 'varchar',
    length: 3,
    default: ',',
  })
  thousandsSeparator: string;

  @Column({
    name: 'decimal_separator',
    type: 'varchar',
    length: 3,
    default: '.',
  })
  decimalSeparator: string;

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 12,
    scale: 6,
    default: 1.0,
  })
  exchangeRate: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => CurrencyRateHistory, (history) => history.currency)
  rateHistory: CurrencyRateHistory[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
