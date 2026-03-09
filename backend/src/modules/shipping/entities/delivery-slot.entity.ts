import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('delivery_slots')
export class DeliverySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'days_of_week', type: 'integer', array: true, default: '{}' })
  daysOfWeek: number[];

  @Column({ name: 'max_orders', type: 'integer', nullable: true })
  maxOrders: number | null;

  @Column({
    name: 'additional_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  additionalFee: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
