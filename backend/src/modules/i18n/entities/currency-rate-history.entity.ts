import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Currency } from './currency.entity';

@Entity('currency_rate_history')
export class CurrencyRateHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'currency_id', type: 'uuid' })
  currencyId: string;

  @ManyToOne(() => Currency, (currency) => currency.rateHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  rate: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @Column({ name: 'recorded_at', type: 'timestamptz', default: () => 'NOW()' })
  recordedAt: Date;
}
