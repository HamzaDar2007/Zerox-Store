import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createConversation(dto: CreateConversationDto): Promise<ServiceResponse<Conversation>> {
    const conversation = new Conversation();
    Object.assign(conversation, dto);
    const saved = await this.conversationRepository.save(conversation);
    return { success: true, message: 'Conversation created', data: saved };
  }

  async findConversations(userId: string): Promise<ServiceResponse<Conversation[]>> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('conversation.buyerId = :userId OR conversation.customerId = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
    return { success: true, message: 'Conversations retrieved', data: conversations };
  }

  async findOne(id: string): Promise<ServiceResponse<Conversation>> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages', 'messages.sender'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return { success: true, message: 'Conversation retrieved', data: conversation };
  }

  async sendMessage(conversationId: string, senderId: string, dto: CreateMessageDto): Promise<ServiceResponse<Message>> {
    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = new Message();
    Object.assign(message, dto);
    message.conversationId = conversationId;
    message.senderId = senderId;
    const saved = await this.messageRepository.save(message);

    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    return { success: true, message: 'Message sent', data: saved };
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<ServiceResponse<Message[]>> {
    const messages = await this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { success: true, message: 'Messages retrieved', data: messages };
  }

  async markAsRead(conversationId: string, userId: string): Promise<ServiceResponse<void>> {
    await this.messageRepository.update(
      { conversationId, isRead: false, senderId: Not(userId) },
      { isRead: true, readAt: new Date() },
    );
    return { success: true, message: 'Messages marked as read' };
  }

  async getUnreadCount(userId: string): Promise<ServiceResponse<number>> {
    const count = await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.conversation', 'conversation')
      .where('(conversation.buyerId = :userId OR conversation.customerId = :userId)', { userId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isRead = false')
      .getCount();
    return { success: true, message: 'Unread count retrieved', data: count };
  }
}
