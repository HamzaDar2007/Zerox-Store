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
import { TicketStatus, TicketPriority } from '@common/enums';
import { User } from '../../users/entities/user.entity';
import { TicketCategory } from './ticket-category.entity';
import { TicketMessage } from './ticket-message.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_number', type: 'varchar', length: 50, unique: true })
  ticketNumber: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => TicketCategory)
  @JoinColumn({ name: 'category_id' })
  category: TicketCategory | null;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignedToUser: User | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Record<string, any>[] | null;

  @Column({ name: 'first_response_at', type: 'timestamptz', nullable: true })
  firstResponseAt: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ name: 'satisfaction_rating', type: 'integer', nullable: true })
  satisfactionRating: number | null;

  @Column({ name: 'satisfaction_comment', type: 'text', nullable: true })
  satisfactionFeedback: string | null;

  @OneToMany(() => TicketMessage, (message) => message.ticket)
  messages: TicketMessage[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
