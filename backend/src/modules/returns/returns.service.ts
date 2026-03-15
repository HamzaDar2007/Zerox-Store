import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Return } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';
import { Order } from '../orders/entities/order.entity';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { MailService } from '../../common/modules/mail/mail.service';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return) private returnRepo: Repository<Return>,
    @InjectRepository(ReturnItem)
    private returnItemRepo: Repository<ReturnItem>,
    private dataSource: DataSource,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
  ) {}

  async create(
    dto: Partial<Return>,
    items?: Partial<ReturnItem>[],
  ): Promise<Return> {
    dto.status = 'requested';
    // Verify the order belongs to the caller
    if (dto.orderId && dto.userId) {
      const order = await this.dataSource
        .getRepository(Order)
        .findOne({ where: { id: dto.orderId as string } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.userId !== dto.userId)
        throw new BadRequestException('Order does not belong to you');
    }
    const saved = await this.dataSource.transaction(async (em) => {
      const ret = em.create(Return, dto);
      const savedRet = await em.save(ret);
      if (items?.length) {
        const returnItems = items.map((i) =>
          em.create(ReturnItem, { ...i, returnId: savedRet.id }),
        );
        await em.save(returnItems);
      }
      return savedRet;
    });

    if (dto.userId) {
      this.notificationHelper
        .notify(dto.userId as string, 'RETURN_REQUESTED', {
          orderId: (dto.orderId as string) || '',
        })
        .catch(() => {});
    }

    // Send return request email
    if (dto.userId) {
      const ret2 = await this.returnRepo.findOne({
        where: { id: saved.id },
        relations: ['user'],
      });
      if (ret2?.user) {
        this.mailService
          .sendReturnRequestedEmail(
            ret2.user.email,
            ret2.user.firstName || 'Customer',
            saved.id,
            (dto.orderId as string) || '',
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  async findAll(options?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Return[]> {
    const where: any = {};
    if (options?.userId) where.userId = options.userId;
    if (options?.status) where.status = options.status;
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    return this.returnRepo.find({
      where,
      relations: ['order', 'user'],
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<Return> {
    const ret = await this.returnRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
    if (!ret) throw new NotFoundException('Return not found');
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, ret.userId);
    return ret;
  }

  async findItems(
    returnId: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<ReturnItem[]> {
    if (callerId) {
      const ret = await this.returnRepo.findOne({ where: { id: returnId } });
      if (!ret) throw new NotFoundException('Return not found');
      enforceOwnerOrAdmin(callerId, callerRole, ret.userId);
    }
    return this.returnItemRepo.find({
      where: { returnId },
      relations: ['orderItem'],
    });
  }

  async updateStatus(
    id: string,
    status: string,
    reviewedBy?: string,
    refundAmount?: number,
  ): Promise<Return> {
    const ret = await this.findOne(id);
    ret.status = status;
    if (reviewedBy) ret.reviewedBy = reviewedBy;
    if (refundAmount !== undefined) ret.refundAmount = refundAmount;
    const saved = await this.returnRepo.save(ret);

    if (ret.userId) {
      const templateKey =
        status === 'approved' ? 'RETURN_APPROVED' : 'ORDER_STATUS_UPDATED';
      this.notificationHelper
        .notify(ret.userId, templateKey, { orderId: ret.orderId || '' })
        .catch(() => {});
      // Send return status update email
      const withUser = await this.returnRepo.findOne({
        where: { id },
        relations: ['user'],
      });
      if (withUser?.user) {
        this.mailService
          .sendReturnStatusUpdateEmail(
            withUser.user.email,
            withUser.user.firstName || 'Customer',
            id,
            status,
          )
          .catch(() => {});
      }
    }

    return saved;
  }
}
