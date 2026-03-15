import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ChatThread } from './chat-thread.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_thread_participants')
export class ChatThreadParticipant {
  @PrimaryColumn({ name: 'thread_id', type: 'uuid' })
  threadId: string;

  @ManyToOne(() => ChatThread, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: ChatThread;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'NOW()' })
  joinedAt: Date;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  lastReadAt: Date | null;
}
