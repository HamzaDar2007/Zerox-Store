import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatThread } from './entities/chat-thread.entity';
import { ChatThreadParticipant } from './entities/chat-thread-participant.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatThread) private threadRepo: Repository<ChatThread>,
    @InjectRepository(ChatThreadParticipant)
    private participantRepo: Repository<ChatThreadParticipant>,
    @InjectRepository(ChatMessage) private messageRepo: Repository<ChatMessage>,
    private dataSource: DataSource,
  ) {}

  async createThread(
    dto: Partial<ChatThread>,
    participantUserIds: string[],
  ): Promise<ChatThread> {
    dto.status = dto.status || 'open';
    return this.dataSource.transaction(async (em) => {
      const thread = em.create(ChatThread, dto);
      const saved = await em.save(thread);
      if (participantUserIds?.length) {
        const participants = participantUserIds.map((uid) =>
          em.create(ChatThreadParticipant, { threadId: saved.id, userId: uid }),
        );
        await em.save(participants);
      }
      return saved;
    });
  }

  async findThread(id: string, callerId?: string): Promise<ChatThread> {
    const thread = await this.threadRepo.findOne({ where: { id } });
    if (!thread) throw new NotFoundException('Thread not found');
    if (callerId) await this.ensureParticipant(id, callerId);
    return thread;
  }

  private async ensureParticipant(
    threadId: string,
    userId: string,
  ): Promise<void> {
    const p = await this.participantRepo.findOne({
      where: { threadId, userId },
    });
    if (!p)
      throw new ForbiddenException('You are not a participant in this thread');
  }

  async getUserThreads(userId: string): Promise<ChatThread[]> {
    const participants = await this.participantRepo.find({
      where: { userId },
      relations: ['thread'],
    });
    return participants.map((p) => p.thread);
  }

  async sendMessage(dto: Partial<ChatMessage>): Promise<ChatMessage> {
    if (dto.threadId && dto.senderId)
      await this.ensureParticipant(dto.threadId, dto.senderId);
    const msg = this.messageRepo.create(dto);
    return this.messageRepo.save(msg);
  }

  async getMessages(
    threadId: string,
    callerId?: string,
  ): Promise<ChatMessage[]> {
    if (callerId) await this.ensureParticipant(threadId, callerId);
    return this.messageRepo.find({
      where: { threadId },
      relations: ['sender'],
      order: { sentAt: 'ASC' },
    });
  }

  async getParticipants(
    threadId: string,
    callerId?: string,
  ): Promise<ChatThreadParticipant[]> {
    if (callerId) await this.ensureParticipant(threadId, callerId);
    return this.participantRepo.find({
      where: { threadId },
      relations: ['user'],
    });
  }

  async updateLastRead(threadId: string, userId: string): Promise<void> {
    await this.participantRepo.update(
      { threadId, userId },
      { lastReadAt: new Date() },
    );
  }

  async updateThreadStatus(
    id: string,
    status: string,
    callerId?: string,
  ): Promise<ChatThread> {
    const thread = await this.findThread(id, callerId);
    thread.status = status;
    return this.threadRepo.save(thread);
  }
}
