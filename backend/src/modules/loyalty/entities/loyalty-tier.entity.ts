import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('loyalty_tiers')
export class LoyaltyTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ name: 'min_points', type: 'integer', default: 0 })
  minPoints: number;

  @Column({ name: 'max_points', type: 'integer', nullable: true })
  maxPoints: number | null;

  @Column({
    name: 'earn_multiplier',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 1.0,
  })
  earnMultiplier: number;

  @Column({ type: 'jsonb', nullable: true })
  benefits: Record<string, any> | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;

  @Column({ name: 'color_hex', type: 'varchar', length: 7, nullable: true })
  colorHex: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
