import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { MailService } from '../../common/modules/mail/mail.service';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    private dataSource: DataSource,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
  ) {}

  async create(
    dto: Partial<Order>,
    items: Partial<OrderItem>[],
  ): Promise<Order> {
    // Server-side price verification and data enrichment
    if (items?.length) {
      const variantIds = items
        .map((i) => i.variantId)
        .filter(Boolean) as string[];
      if (variantIds.length) {
        const variants = await this.dataSource.query(
          `SELECT pv.id, pv.price, pv.sku, p.name AS product_name, p.store_id
           FROM product_variants pv
           JOIN products p ON p.id = pv.product_id
           WHERE pv.id = ANY($1) AND pv.is_active = true`,
          [variantIds],
        );
        const variantMap = new Map<string, any>(
          variants.map((v: any) => [v.id, v]),
        );
        for (const item of items) {
          if (!item.variantId) continue;
          const variant = variantMap.get(item.variantId);
          if (!variant) {
            throw new BadRequestException(
              `Variant ${item.variantId} not found or inactive`,
            );
          }
          // Derive all fields server-side
          item.unitPrice = Number(variant.price) as any;
          item.storeId = variant.store_id;
          item.skuSnapshot = variant.sku || '';
          item.nameSnapshot = variant.product_name || '';
          const qty = Number(item.quantity) || 1;
          item.discountAmount = 0 as any;
          item.taxAmount = 0 as any;
          item.totalAmount = (Number(item.unitPrice) * qty) as any;
        }
      }
    }

    const saved = await this.dataSource.transaction(async (em) => {
      // Calculate server-side totals from verified item prices
      const subtotal = items.reduce(
        (sum, item) =>
          sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
        0,
      );
      const shippingAmount = Number(dto.shippingAmount) || 0;
      const discountAmount = 0;
      const taxAmount = 0;
      const totalAmount =
        subtotal - discountAmount + shippingAmount + taxAmount;
      dto.status = dto.status || 'pending';
      dto.subtotal = subtotal as any;
      dto.discountAmount = discountAmount as any;
      dto.shippingAmount = shippingAmount as any;
      dto.taxAmount = taxAmount as any;
      dto.totalAmount = totalAmount as any;

      const order = em.create(Order, dto);
      const savedOrder = await em.save(order);
      const orderItems = items.map((i) =>
        em.create(OrderItem, { ...i, orderId: savedOrder.id }),
      );
      await em.save(orderItems);
      return savedOrder;
    });

    if (dto.userId) {
      this.notificationHelper
        .notify(dto.userId as string, 'ORDER_PLACED', { orderId: saved.id })
        .catch(() => {});
    }

    // Send order confirmation email if user relation is loaded
    if (dto.userId) {
      const order = await this.orderRepo.findOne({
        where: { id: saved.id },
        relations: ['user'],
      });
      if (order?.user) {
        this.mailService
          .sendOrderConfirmation(
            order.user.email,
            order.user.firstName || 'Customer',
            saved.id,
            Number(saved.totalAmount ?? 0),
            'PKR',
            [],
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  async findAll(options?: {
    userId?: string;
    storeId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Order[]; total: number }> {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'user');
    if (options?.storeId) {
      qb.innerJoin('order_items', 'oi', 'oi.order_id = o.id')
        .andWhere('oi.store_id = :storeId', { storeId: options.storeId })
        .groupBy('o.id')
        .addGroupBy('user.id');
    }
    if (options?.userId)
      qb.andWhere('o.userId = :userId', { userId: options.userId });
    if (options?.status)
      qb.andWhere('o.status = :status', { status: options.status });
    const pg = options?.page || 1;
    const lm = options?.limit || 20;
    qb.skip((pg - 1) * lm)
      .take(lm)
      .orderBy('o.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'coupon'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, order.userId);
    return order;
  }

  async findItems(
    orderId: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<OrderItem[]> {
    if (callerId) {
      const order = await this.orderRepo.findOne({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Order not found');
      enforceOwnerOrAdmin(callerId, callerRole, order.userId);
    }
    return this.orderItemRepo.find({
      where: { orderId },
      relations: ['variant', 'store'],
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.findOne(id);
    const previousStatus = order.status;
    order.status = status;
    const saved = await this.orderRepo.save(order);

    const templateMap: Record<string, string> = {
      shipped: 'ORDER_SHIPPED',
      delivered: 'ORDER_DELIVERED',
    };
    const templateKey = templateMap[status] || 'ORDER_STATUS_UPDATED';
    if (order.userId) {
      this.notificationHelper
        .notify(order.userId, templateKey, { orderId: id, status })
        .catch(() => {});
      // Send status update email
      if (order.user) {
        this.mailService
          .sendOrderStatusUpdate(
            order.user.email,
            order.user.firstName || 'Customer',
            id,
            previousStatus,
            status,
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  async cancelOrder(
    id: string,
    callerId: string,
    callerRole: string,
  ): Promise<Order> {
    const order = await this.findOne(id, callerId, callerRole);
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new BadRequestException(
        'Only pending or confirmed orders can be cancelled',
      );
    }
    order.status = 'cancelled';
    const saved = await this.orderRepo.save(order);

    if (order.userId) {
      this.notificationHelper
        .notify(order.userId, 'ORDER_CANCELLED', { orderId: id })
        .catch(() => {});
    }

    return saved;
  }
}
