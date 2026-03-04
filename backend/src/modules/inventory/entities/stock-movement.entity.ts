import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StockMovementType } from '@common/enums';
import { Inventory } from './inventory.entity';
import { User } from '../../users/entities/user.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId: string;

  @ManyToOne(() => Inventory, (inv) => inv.movements)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ name: 'quantity_before', type: 'integer' })
  quantityBefore: number;

  @Column({ name: 'quantity_after', type: 'integer' })
  quantityAfter: number;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ name: 'cost_per_unit', type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPerUnit: number | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
