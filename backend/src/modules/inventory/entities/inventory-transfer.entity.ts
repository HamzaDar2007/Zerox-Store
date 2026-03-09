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
import { TransferStatus } from '@common/enums';
import { Warehouse } from './warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { InventoryTransferItem } from './inventory-transfer-item.entity';

@Entity('inventory_transfers')
export class InventoryTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'transfer_number',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  transferNumber: string;

  @Column({ name: 'from_warehouse_id', type: 'uuid' })
  fromWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'from_warehouse_id' })
  fromWarehouse: Warehouse;

  @Column({ name: 'to_warehouse_id', type: 'uuid' })
  toWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'to_warehouse_id' })
  toWarehouse: Warehouse;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'initiated_by', type: 'uuid' })
  initiatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiated_by' })
  initiator: User;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  receivedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @OneToMany(() => InventoryTransferItem, (item) => item.transfer)
  items: InventoryTransferItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
