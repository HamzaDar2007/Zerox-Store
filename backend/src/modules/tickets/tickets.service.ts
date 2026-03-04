import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { TicketCategory } from './entities/ticket-category.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { CreateTicketDto, UpdateTicketDto, CreateTicketMessageDto, CreateTicketCategoryDto } from './dto';
import { TicketStatus, TicketPriority } from '@common/enums';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private messageRepository: Repository<TicketMessage>,
    @InjectRepository(TicketCategory)
    private categoryRepository: Repository<TicketCategory>,
    private readonly mailService: MailService,
  ) {}

  async create(userId: string, dto: CreateTicketDto): Promise<ServiceResponse<Ticket>> {
    const ticketNumber = await this.generateTicketNumber();
    const ticket = new Ticket();
    Object.assign(ticket, dto);
    ticket.userId = userId;
    ticket.ticketNumber = ticketNumber;
    ticket.status = TicketStatus.OPEN;
    ticket.priority = dto.priority || TicketPriority.MEDIUM;
    const saved = await this.ticketRepository.save(ticket);

    // Send ticket created emails (fire-and-forget)
    this.sendTicketCreatedEmails(saved).catch(() => {});

    return { success: true, message: 'Ticket created', data: saved };
  }

  async findAll(options?: { userId?: string; status?: TicketStatus; priority?: TicketPriority; categoryId?: string; page?: number; limit?: number }): Promise<ServiceResponse<Ticket[]>> {
    const query = this.ticketRepository.createQueryBuilder('ticket').leftJoinAndSelect('ticket.category', 'category').orderBy('ticket.createdAt', 'DESC');
    if (options?.userId) query.andWhere('ticket.userId = :userId', { userId: options.userId });
    if (options?.status) query.andWhere('ticket.status = :status', { status: options.status });
    if (options?.priority) query.andWhere('ticket.priority = :priority', { priority: options.priority });
    if (options?.categoryId) query.andWhere('ticket.categoryId = :categoryId', { categoryId: options.categoryId });
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    const [tickets, total] = await query.getManyAndCount();
    return { success: true, message: 'Tickets retrieved', data: tickets, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<ServiceResponse<Ticket>> {
    const ticket = await this.ticketRepository.findOne({ where: { id }, relations: ['category', 'messages', 'user', 'assignedToUser'] });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return { success: true, message: 'Ticket retrieved', data: ticket };
  }

  async update(id: string, dto: UpdateTicketDto): Promise<ServiceResponse<Ticket>> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    Object.assign(ticket, dto);
    const updated = await this.ticketRepository.save(ticket);
    return { success: true, message: 'Ticket updated', data: updated };
  }

  async updateStatus(id: string, status: TicketStatus): Promise<ServiceResponse<Ticket>> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    ticket.status = status;
    if (status === TicketStatus.RESOLVED) ticket.resolvedAt = new Date();
    if (status === TicketStatus.CLOSED) ticket.closedAt = new Date();
    const updated = await this.ticketRepository.save(ticket);

    // Send ticket status update email (fire-and-forget)
    this.sendTicketStatusEmail(updated).catch(() => {});

    return { success: true, message: `Ticket ${status.toLowerCase()}`, data: updated };
  }

  async assignTicket(id: string, assignedToId: string): Promise<ServiceResponse<Ticket>> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    ticket.assignedTo = assignedToId;
    ticket.status = TicketStatus.IN_PROGRESS;
    const updated = await this.ticketRepository.save(ticket);

    // Send ticket assigned email (fire-and-forget)
    this.sendTicketAssignedNotification(updated).catch(() => {});

    return { success: true, message: 'Ticket assigned', data: updated };
  }

  async addMessage(ticketId: string, senderId: string, dto: CreateTicketMessageDto): Promise<ServiceResponse<TicketMessage>> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    const message = new TicketMessage();
    Object.assign(message, dto);
    message.ticketId = ticketId;
    message.senderId = senderId;
    const saved = await this.messageRepository.save(message);

    // Send ticket reply notification (fire-and-forget)
    this.sendTicketReplyNotification(ticketId, senderId).catch(() => {});

    return { success: true, message: 'Message added', data: saved };
  }

  async getMessages(ticketId: string): Promise<ServiceResponse<TicketMessage[]>> {
    const messages = await this.messageRepository.find({ where: { ticketId }, relations: ['sender'], order: { createdAt: 'ASC' } });
    return { success: true, message: 'Messages retrieved', data: messages };
  }

  async getCategories(): Promise<ServiceResponse<TicketCategory[]>> {
    const categories = await this.categoryRepository.find({ where: { isActive: true } });
    return { success: true, message: 'Categories retrieved', data: categories };
  }

  async createCategory(dto: CreateTicketCategoryDto): Promise<ServiceResponse<TicketCategory>> {
    const category = new TicketCategory();
    Object.assign(category, dto);
    const saved = await this.categoryRepository.save(category);
    return { success: true, message: 'Category created', data: saved };
  }

  private async generateTicketNumber(): Promise<string> {
    const count = await this.ticketRepository.count();
    return `TKT${String(count + 1).padStart(8, '0')}`;
  }

  private async sendTicketCreatedEmails(ticket: Ticket): Promise<void> {
    try {
      const full = await this.ticketRepository.findOne({
        where: { id: ticket.id },
        relations: ['user'],
      });
      if (!full?.user?.email) return;
      await this.mailService.sendTicketCreatedEmail(
        full.user.email, full.user.name || 'Customer',
        full.ticketNumber, full.subject,
      );
      this.mailService.sendAdminNewTicketAlert(
        full.ticketNumber, full.subject, full.user.name || 'Customer',
      ).catch(() => {});
    } catch (_) { /* silently ignore */ }
  }

  private async sendTicketStatusEmail(ticket: Ticket): Promise<void> {
    try {
      const full = await this.ticketRepository.findOne({
        where: { id: ticket.id },
        relations: ['user'],
      });
      if (!full?.user?.email) return;
      await this.mailService.sendTicketStatusUpdateEmail(
        full.user.email, full.user.name || 'Customer',
        full.ticketNumber, full.status,
      );
    } catch (_) { /* silently ignore */ }
  }

  private async sendTicketAssignedNotification(ticket: Ticket): Promise<void> {
    try {
      const full = await this.ticketRepository.findOne({
        where: { id: ticket.id },
        relations: ['assignedToUser'],
      });
      if (!full?.assignedToUser?.email) return;
      await this.mailService.sendTicketAssignedEmail(
        full.assignedToUser.email, full.assignedToUser.name || 'Agent',
        full.ticketNumber, full.subject,
      );
    } catch (_) { /* silently ignore */ }
  }

  private async sendTicketReplyNotification(ticketId: string, senderId: string): Promise<void> {
    try {
      const full = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: ['user'],
      });
      if (!full) return;
      // If sender is the customer, skip notifying them; otherwise notify the customer
      if (senderId !== full.userId && full.user?.email) {
        await this.mailService.sendTicketReplyEmail(
          full.user.email, full.user.name || 'Customer',
          full.ticketNumber, 'Support Team',
        );
      }
    } catch (_) { /* silently ignore */ }
  }
}
