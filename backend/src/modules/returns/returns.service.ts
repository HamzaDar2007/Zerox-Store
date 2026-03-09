import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest } from './entities/return-request.entity';
import { ReturnReason } from './entities/return-reason.entity';
import { ReturnImage } from './entities/return-image.entity';
import { ReturnShipment } from './entities/return-shipment.entity';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { CreateReturnReasonDto } from './dto/create-return-reason.dto';
import { UpdateReturnReasonDto } from './dto/update-return-reason.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { ReturnStatus } from '@common/enums';
import { MailService } from '../../common/modules/mail/mail.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private returnRepository: Repository<ReturnRequest>,
    @InjectRepository(ReturnReason)
    private reasonRepository: Repository<ReturnReason>,
    @InjectRepository(ReturnImage)
    private imageRepository: Repository<ReturnImage>,
    @InjectRepository(ReturnShipment)
    private shipmentRepository: Repository<ReturnShipment>,
    private readonly mailService: MailService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // ==================== RETURN REQUESTS ====================

  async createReturn(
    dto: CreateReturnRequestDto,
    userId: string,
  ): Promise<ServiceResponse<ReturnRequest>> {
    const returnNumber = await this.generateReturnNumber();

    const returnRequest = new ReturnRequest();
    Object.assign(returnRequest, {
      ...dto,
      userId,
      returnNumber,
      status: ReturnStatus.REQUESTED,
    });

    const savedReturn = await this.returnRepository.save(returnRequest);

    // Send return request emails (fire-and-forget)
    this.sendReturnCreatedEmails(savedReturn).catch(() => {});

    return {
      success: true,
      message: 'Return request created successfully',
      data: savedReturn,
    };
  }

  async findAll(options?: {
    userId?: string;
    sellerId?: string;
    orderId?: string;
    status?: ReturnStatus;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<ReturnRequest[]>> {
    const query = this.returnRepository
      .createQueryBuilder('return')
      .leftJoinAndSelect('return.order', 'order')
      .leftJoinAndSelect('return.reason', 'reason')
      .orderBy('return.createdAt', 'DESC');

    if (options?.userId) {
      query.andWhere('return.userId = :userId', { userId: options.userId });
    }

    if (options?.orderId) {
      query.andWhere('return.orderId = :orderId', { orderId: options.orderId });
    }

    if (options?.status) {
      query.andWhere('return.status = :status', { status: options.status });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [returns, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Returns retrieved successfully',
      data: returns,
      meta: { total, page, limit },
    };
  }

  async findOne(id: string): Promise<ServiceResponse<ReturnRequest>> {
    const returnRequest = await this.returnRepository.findOne({
      where: { id },
      relations: ['order', 'reason', 'images', 'shipments'],
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    return {
      success: true,
      message: 'Return request retrieved successfully',
      data: returnRequest,
    };
  }

  async updateReturn(
    id: string,
    dto: UpdateReturnRequestDto,
  ): Promise<ServiceResponse<ReturnRequest>> {
    const returnRequest = await this.returnRepository.findOne({
      where: { id },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    Object.assign(returnRequest, dto);
    const updated = await this.returnRepository.save(returnRequest);

    return {
      success: true,
      message: 'Return request updated successfully',
      data: updated,
    };
  }

  async updateStatus(
    id: string,
    status: ReturnStatus,
    notes?: string,
  ): Promise<ServiceResponse<ReturnRequest>> {
    const returnRequest = await this.returnRepository.findOne({
      where: { id },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    returnRequest.status = status;
    if (notes) returnRequest.reviewerNotes = notes;

    if (status === ReturnStatus.APPROVED) {
      returnRequest.reviewedAt = new Date();
    } else if (status === ReturnStatus.COMPLETED) {
      returnRequest.completedAt = new Date();

      // Auto-create refund when return is completed
      if (returnRequest.refundAmount && returnRequest.orderId) {
        this.paymentsService
          .createRefund(
            {
              paymentId: returnRequest.orderId,
              amount: Number(returnRequest.refundAmount),
              reason: undefined,
              reasonDetails: `Refund for return ${returnRequest.returnNumber}`,
            },
            'system',
          )
          .catch(() => {});
      }
    }

    const updated = await this.returnRepository.save(returnRequest);

    // Send return status update email (fire-and-forget)
    this.sendReturnStatusEmail(updated).catch(() => {});

    return {
      success: true,
      message: `Return request ${status.toLowerCase()}`,
      data: updated,
    };
  }

  async addReturnImage(
    returnId: string,
    imageUrl: string,
  ): Promise<ServiceResponse<ReturnImage>> {
    const returnRequest = await this.returnRepository.findOne({
      where: { id: returnId },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    const image = new ReturnImage();
    Object.assign(image, {
      returnRequestId: returnId,
      imageUrl,
    });

    const savedImage = await this.imageRepository.save(image);

    return {
      success: true,
      message: 'Image added successfully',
      data: savedImage,
    };
  }

  // ==================== RETURN REASONS ====================

  async createReason(
    dto: CreateReturnReasonDto,
  ): Promise<ServiceResponse<ReturnReason>> {
    const reason = new ReturnReason();
    Object.assign(reason, dto);
    const saved = await this.reasonRepository.save(reason);

    return {
      success: true,
      message: 'Return reason created successfully',
      data: saved,
    };
  }

  async findAllReasons(): Promise<ServiceResponse<ReturnReason[]>> {
    const reasons = await this.reasonRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    return {
      success: true,
      message: 'Return reasons retrieved successfully',
      data: reasons,
    };
  }

  async updateReason(
    id: string,
    dto: UpdateReturnReasonDto,
  ): Promise<ServiceResponse<ReturnReason>> {
    const reason = await this.reasonRepository.findOne({ where: { id } });

    if (!reason) {
      throw new NotFoundException('Return reason not found');
    }

    Object.assign(reason, dto);
    const updated = await this.reasonRepository.save(reason);

    return {
      success: true,
      message: 'Return reason updated successfully',
      data: updated,
    };
  }

  private async generateReturnNumber(): Promise<string> {
    const date = new Date();
    const prefix = `RET${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.returnRepository.count();
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }

  private async sendReturnCreatedEmails(
    returnRequest: ReturnRequest,
  ): Promise<void> {
    try {
      const full = await this.returnRepository.findOne({
        where: { id: returnRequest.id },
        relations: ['user', 'order'],
      });
      if (!full?.user?.email) return;
      await this.mailService.sendReturnRequestedEmail(
        full.user.email,
        full.user.name || 'Customer',
        full.returnNumber,
        full.order?.orderNumber || 'N/A',
      );
    } catch (_) {
      /* silently ignore */
    }
  }

  private async sendReturnStatusEmail(
    returnRequest: ReturnRequest,
  ): Promise<void> {
    try {
      const full = await this.returnRepository.findOne({
        where: { id: returnRequest.id },
        relations: ['user'],
      });
      if (!full?.user?.email) return;
      await this.mailService.sendReturnStatusUpdateEmail(
        full.user.email,
        full.user.name || 'Customer',
        full.returnNumber,
        full.status,
        full.reviewerNotes,
      );
    } catch (_) {
      /* silently ignore */
    }
  }
}
