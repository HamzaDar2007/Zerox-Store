import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { LoginStatus } from '@common/enums';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'login_at', type: 'timestamptz' })
  loginAt: Date;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({
    name: 'device_fingerprint',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  deviceFingerprint: string | null;

  @Column({
    type: 'enum',
    enum: LoginStatus,
    default: LoginStatus.SUCCESS,
  })
  status: LoginStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({
    name: 'location_country',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  locationCountry: string | null;

  @Column({
    name: 'location_city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  locationCity: string | null;
}
