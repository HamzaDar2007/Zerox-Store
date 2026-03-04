import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RedirectType } from '@common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('url_redirects')
export class UrlRedirect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_url', type: 'varchar', length: 500, unique: true })
  sourceUrl: string;

  @Column({ name: 'target_url', type: 'varchar', length: 500 })
  targetUrl: string;

  @Column({
    name: 'redirect_type',
    type: 'enum',
    enum: RedirectType,
    default: RedirectType.PERMANENT_301,
  })
  redirectType: RedirectType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'hit_count', type: 'integer', default: 0 })
  hitCount: number;

  @Column({ name: 'last_hit_at', type: 'timestamptz', nullable: true })
  lastHitAt: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
