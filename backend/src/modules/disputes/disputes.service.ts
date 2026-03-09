import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity';
import { DisputeEvidence } from './entities/dispute-evidence.entity';
import { DisputeMessage } from './entities/dispute-message.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { DisputeStatus, DisputeResolution } from '@common/enums';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateDisputeEvidenceDto } from './dto/create-dispute-evidence.dto';
import { CreateDisputeMessageDto } from './dto/create-dispute-message.dto';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeEvidence)
    private evidenceRepository: Repository<DisputeEvidence>,
    @InjectRepository(DisputeMessage)
    private messageRepository: Repository<DisputeMessage>,
    private readonly mailService: MailService,
  ) {}

  async create(
    dto: CreateDisputeDto,
    customerId: string,
  ): Promise<ServiceResponse<Dispute>> {
    const disputeNumber = await this.generateDisputeNumber();

    const dispute = new Dispute();
    Object.assign(dispute, dto);
    dispute.customerId = customerId;
    dispute.disputeNumber = disputeNumber;
    dispute.status = DisputeStatus.OPEN;

    const saved = await this.disputeRepository.save(dispute);

    // Send dispute opened emails (fire-and-forget)
    this.sendDisputeCreatedEmails(saved).catch(() => {});

    return { success: true, message: 'Dispute created', data: saved };
  }

  async findAll(options?: {
    customerId?: string;
    orderId?: string;
    status?: DisputeStatus;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Dispute[]>> {
    const query = this.disputeRepository
      .createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.order', 'order')
      .leftJoinAndSelect('dispute.customer', 'customer')
      .orderBy('dispute.createdAt', 'DESC');
    if (options?.customerId)
      query.andWhere('dispute.customerId = :customerId', {
        customerId: options.customerId,
      });
    if (options?.orderId)
      query.andWhere('dispute.orderId = :orderId', {
        orderId: options.orderId,
      });
    if (options?.status)
      query.andWhere('dispute.status = :status', { status: options.status });
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    const [disputes, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Disputes retrieved',
      data: disputes,
      meta: { total, page, limit },
    };
  }

  async findOne(id: string): Promise<ServiceResponse<Dispute>> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['order', 'evidence', 'messages', 'customer', 'seller'],
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return { success: true, message: 'Dispute retrieved', data: dispute };
  }

  async updateStatus(
    id: string,
    status: DisputeStatus,
    resolution?: DisputeResolution,
  ): Promise<ServiceResponse<Dispute>> {
    const dispute = await this.disputeRepository.findOne({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    dispute.status = status;
    if (resolution) dispute.resolution = resolution;
    if (status === DisputeStatus.RESOLVED || status === DisputeStatus.CLOSED) {
      dispute.resolvedAt = new Date();
    }
    const updated = await this.disputeRepository.save(dispute);

    // Send dispute status update emails (fire-and-forget)
    this.sendDisputeStatusEmails(updated).catch(() => {});

    return {
      success: true,
      message: `Dispute ${status.toLowerCase()}`,
      data: updated,
    };
  }

  async addEvidence(
    disputeId: string,
    dto: CreateDisputeEvidenceDto,
    submittedBy: string,
  ): Promise<ServiceResponse<DisputeEvidence>> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    const evidence = new DisputeEvidence();
    Object.assign(evidence, dto);
    evidence.disputeId = disputeId;
    evidence.submittedBy = submittedBy;
    const saved = await this.evidenceRepository.save(evidence);
    return { success: true, message: 'Evidence added', data: saved };
  }

  async addMessage(
    disputeId: string,
    dto: CreateDisputeMessageDto,
    senderId: string,
  ): Promise<ServiceResponse<DisputeMessage>> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    const message = new DisputeMessage();
    Object.assign(message, dto);
    message.disputeId = disputeId;
    message.senderId = senderId;
    const saved = await this.messageRepository.save(message);

    // Send new message notification (fire-and-forget)
    this.sendDisputeMessageNotification(disputeId, senderId).catch(() => {});

    return { success: true, message: 'Message added', data: saved };
  }

  async getMessages(
    disputeId: string,
  ): Promise<ServiceResponse<DisputeMessage[]>> {
    const messages = await this.messageRepository.find({
      where: { disputeId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
    return { success: true, message: 'Messages retrieved', data: messages };
  }

  private async generateDisputeNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.disputeRepository.count();
    return `DSP${year}${month}${String(count + 1).padStart(6, '0')}`;
  }

  private async sendDisputeCreatedEmails(dispute: Dispute): Promise<void> {
    try {
      const full = await this.disputeRepository.findOne({
        where: { id: dispute.id },
        relations: ['customer', 'seller', 'order'],
      });
      if (!full) return;
      const orderNum = full.order?.orderNumber || 'N/A';
      if (full.customer?.email) {
        await this.mailService.sendDisputeOpenedEmail(
          full.customer.email,
          full.customer.name || 'Customer',
          full.disputeNumber,
          orderNum,
          'customer',
        );
      }
      if (full.seller?.email) {
        await this.mailService.sendDisputeOpenedEmail(
          full.seller.email,
          full.seller.name || 'Seller',
          full.disputeNumber,
          orderNum,
          'seller',
        );
      }
    } catch (_) {
      /* silently ignore */
    }
  }

  private async sendDisputeStatusEmails(dispute: Dispute): Promise<void> {
    try {
      const full = await this.disputeRepository.findOne({
        where: { id: dispute.id },
        relations: ['customer', 'seller'],
      });
      if (!full) return;
      const res = full.resolution ? String(full.resolution) : undefined;
      if (full.customer?.email) {
        await this.mailService.sendDisputeStatusUpdateEmail(
          full.customer.email,
          full.customer.name || 'Customer',
          full.disputeNumber,
          full.status,
          res,
        );
      }
      if (full.seller?.email) {
        await this.mailService.sendDisputeStatusUpdateEmail(
          full.seller.email,
          full.seller.name || 'Seller',
          full.disputeNumber,
          full.status,
          res,
        );
      }
    } catch (_) {
      /* silently ignore */
    }
  }

  private async sendDisputeMessageNotification(
    disputeId: string,
    senderId: string,
  ): Promise<void> {
    try {
      const full = await this.disputeRepository.findOne({
        where: { id: disputeId },
        relations: ['customer', 'seller'],
      });
      if (!full) return;
      // Notify the other party
      const senderIsCustomer = senderId === full.customerId;
      const recipient = senderIsCustomer ? full.seller : full.customer;
      const senderUser = senderIsCustomer ? full.customer : full.seller;
      if (recipient?.email) {
        await this.mailService.sendDisputeNewMessageEmail(
          recipient.email,
          recipient.name || 'User',
          full.disputeNumber,
          senderUser?.name || 'Other Party',
        );
      }
    } catch (_) {
      /* silently ignore */
    }
  }
}
