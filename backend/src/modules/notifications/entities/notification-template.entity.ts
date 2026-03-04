import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationType, NotificationChannel } from '@common/enums';

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  type: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
    default: '{}',
  })
  channels: NotificationChannel[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ name: 'html_body', type: 'text', nullable: true })
  htmlBody: string | null;

  @Column({ name: 'sms_body', type: 'varchar', length: 160, nullable: true })
  smsBody: string | null;

  @Column({ name: 'push_title', type: 'varchar', length: 100, nullable: true })
  pushTitle: string | null;

  @Column({ name: 'push_body', type: 'varchar', length: 255, nullable: true })
  pushBody: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  variables: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
