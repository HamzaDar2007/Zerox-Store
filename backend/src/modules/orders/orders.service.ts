import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderSnapshot } from './entities/order-snapshot.entity';
import { Shipment } from './entities/shipment.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { OrderStatus, ShipmentStatus } from '@common/enums';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private statusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(OrderSnapshot)
    private snapshotRepository: Repository<OrderSnapshot>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentItem)
    private shipmentItemRepository: Repository<ShipmentItem>,
    private dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  // ==================== ORDER CRUD ====================

  async create(dto: CreateOrderDto, userId: string): Promise<ServiceResponse<Order>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      const order = new Order();
      Object.assign(order, {
        ...dto,
        userId,
        orderNumber,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create status history entry
      const statusHistory = new OrderStatusHistory();
      Object.assign(statusHistory, {
        orderId: savedOrder.id,
        newStatus: OrderStatus.PENDING,
        notes: 'Order created',
        changedBy: userId,
      });
      await queryRunner.manager.save(statusHistory);

      await queryRunner.commitTransaction();

      // Send order confirmation email (fire-and-forget)
      this.sendOrderEmail(savedOrder).catch(() => {});

      return {
        success: true,
        message: 'Order created successfully',
        data: savedOrder,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /** Fetch user & items, then send order confirmation email */
  private async sendOrderEmail(order: Order): Promise<void> {
    try {
      const fullOrder = await this.orderRepository.findOne({
        where: { id: order.id },
        relations: ['user', 'items', 'items.product'],
      });
      if (!fullOrder?.user?.email) return;
      const items = (fullOrder.items || []).map((i) => ({
        name: i.product?.name || i.productSnapshot?.name || 'Product',
        quantity: i.quantity,
        price: Number(i.unitPrice) * i.quantity,
      }));
      await this.mailService.sendOrderConfirmation(
        fullOrder.user.email,
        fullOrder.user.name || 'Customer',
        fullOrder.orderNumber,
        Number(fullOrder.totalAmount),
        fullOrder.currencyCode || 'PKR',
        items,
      );
      // Notify admin about new order
      this.mailService.sendAdminNewOrderAlert(
        fullOrder.orderNumber,
        Number(fullOrder.totalAmount),
        fullOrder.currencyCode || 'PKR',
        fullOrder.user.name || 'Customer',
      ).catch(() => {});
    } catch (err) { /* silently ignore */ }
  }

  async findAll(options?: {
    userId?: string;
    sellerId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Order[]>> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC');

    if (options?.userId) {
      query.andWhere('order.userId = :userId', { userId: options.userId });
    }

    if (options?.sellerId) {
      query.andWhere('order.storeId = :sellerId', { sellerId: options.sellerId });
    }

    if (options?.status) {
      query.andWhere('order.status = :status', { status: options.status });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [orders, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
      meta: { total, page, limit },
    };
  }

  async findOne(id: string): Promise<ServiceResponse<Order>> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'items.variant',
        'user',
        'store',
        'shipments',
        'statusHistory',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  async findByOrderNumber(orderNumber: string): Promise<ServiceResponse<Order>> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'items.product', 'shipments'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  async update(id: string, dto: UpdateOrderDto): Promise<ServiceResponse<Order>> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    Object.assign(order, dto);
    const updatedOrder = await this.orderRepository.save(order);

    return {
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    };
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    comment: string,
    userId: string,
  ): Promise<ServiceResponse<Order>> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const previousStatus = order.status;
    order.status = status;

    // Update timestamps based on status
    if (status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
    }

    await this.orderRepository.save(order);

    // Record status history
    const statusHistory = new OrderStatusHistory();
    Object.assign(statusHistory, {
      orderId: id,
      previousStatus,
      newStatus: status,
      notes: comment,
      changedBy: userId,
    });
    await this.statusHistoryRepository.save(statusHistory);

    // Send status update email (fire-and-forget)
    this.sendStatusEmail(order, previousStatus, status).catch(() => {});

    return {
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    };
  }

  /** Fetch user and send order status / cancellation email */
  private async sendStatusEmail(order: Order, previousStatus: string, newStatus: string): Promise<void> {
    try {
      const fullOrder = await this.orderRepository.findOne({ where: { id: order.id }, relations: ['user'] });
      if (!fullOrder?.user?.email) return;
      if (newStatus === OrderStatus.CANCELLED) {
        await this.mailService.sendOrderCancellation(
          fullOrder.user.email,
          fullOrder.user.name || 'Customer',
          fullOrder.orderNumber,
          'Order was cancelled',
        );
      } else {
        await this.mailService.sendOrderStatusUpdate(
          fullOrder.user.email,
          fullOrder.user.name || 'Customer',
          fullOrder.orderNumber,
          previousStatus,
          newStatus,
        );
      }
    } catch (err) { /* silently ignore */ }
  }

  async cancel(id: string, reason: string, userId: string): Promise<ServiceResponse<Order>> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel shipped or delivered orders');
    }

    return this.updateStatus(id, OrderStatus.CANCELLED, reason, userId);
  }

  async getStatusHistory(orderId: string): Promise<ServiceResponse<OrderStatusHistory[]>> {
    const history = await this.statusHistoryRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Status history retrieved successfully',
      data: history,
    };
  }

  // ==================== ORDER ITEMS ====================

  async addItem(orderId: string, dto: any): Promise<ServiceResponse<OrderItem>> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot modify non-pending order');
    }

    const item = new OrderItem();
    Object.assign(item, {
      ...dto,
      orderId,
    });

    const savedItem = await this.orderItemRepository.save(item);
    await this.recalculateOrderTotal(orderId);

    return {
      success: true,
      message: 'Order item added successfully',
      data: savedItem,
    };
  }

  async removeItem(itemId: string): Promise<ServiceResponse<void>> {
    const item = await this.orderItemRepository.findOne({
      where: { id: itemId },
      relations: ['order'],
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    if (item.order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot modify non-pending order');
    }

    const orderId = item.orderId;
    await this.orderItemRepository.remove(item);
    await this.recalculateOrderTotal(orderId);

    return {
      success: true,
      message: 'Order item removed successfully',
    };
  }

  private async recalculateOrderTotal(orderId: string): Promise<void> {
    const items = await this.orderItemRepository.find({ where: { orderId } });

    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.unitPrice) * item.quantity;
    }

    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (order) {
      order.subtotal = subtotal;
      order.totalAmount = subtotal + Number(order.shippingAmount || 0) + Number(order.taxAmount || 0) - Number(order.discountAmount || 0);
      await this.orderRepository.save(order);
    }
  }

  // ==================== SHIPMENTS ====================

  async createShipment(orderId: string, dto: CreateShipmentDto): Promise<ServiceResponse<Shipment>> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const shipment = new Shipment();
    Object.assign(shipment, {
      ...dto,
      orderId,
      status: ShipmentStatus.PENDING,
    });

    const savedShipment = await this.shipmentRepository.save(shipment);

    // Send shipment created email to customer (fire-and-forget)
    this.sendShipmentEmail(orderId, savedShipment).catch(() => {});

    return {
      success: true,
      message: 'Shipment created successfully',
      data: savedShipment,
    };
  }

  /** Fetch order user and send shipment notification */
  private async sendShipmentEmail(orderId: string, shipment: Shipment): Promise<void> {
    try {
      const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['user'] });
      if (!order?.user?.email) return;
      await this.mailService.sendShipmentCreatedEmail(
        order.user.email, order.user.name || 'Customer',
        order.orderNumber, shipment.trackingNumber || '', shipment.carrierName || '',
      );
    } catch (_) { /* silently ignore */ }
  }

  async getShipments(orderId: string): Promise<ServiceResponse<Shipment[]>> {
    const shipments = await this.shipmentRepository.find({
      where: { orderId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Shipments retrieved successfully',
      data: shipments,
    };
  }

  async updateShipment(shipmentId: string, dto: UpdateShipmentDto): Promise<ServiceResponse<Shipment>> {
    const shipment = await this.shipmentRepository.findOne({ where: { id: shipmentId } });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    Object.assign(shipment, dto);
    const updatedShipment = await this.shipmentRepository.save(shipment);

    return {
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment,
    };
  }

  async updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus,
  ): Promise<ServiceResponse<Shipment>> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.status = status;

    if (status === ShipmentStatus.SHIPPED) {
      shipment.shippedAt = new Date();
    } else if (status === ShipmentStatus.DELIVERED) {
      shipment.deliveredAt = new Date();
    }

    await this.shipmentRepository.save(shipment);

    // Send shipment status update email to customer (fire-and-forget)
    this.sendShipmentStatusEmail(shipment).catch(() => {});

    return {
      success: true,
      message: `Shipment status updated to ${status}`,
      data: shipment,
    };
  }

  /** Fetch order + user and send shipment status update email */
  private async sendShipmentStatusEmail(shipment: Shipment): Promise<void> {
    try {
      const fullShipment = await this.shipmentRepository.findOne({
        where: { id: shipment.id },
        relations: ['order', 'order.user'],
      });
      if (!fullShipment?.order?.user?.email) return;
      await this.mailService.sendShipmentStatusUpdateEmail(
        fullShipment.order.user.email,
        fullShipment.order.user.name || 'Customer',
        fullShipment.order.orderNumber,
        fullShipment.trackingNumber || '',
        fullShipment.status,
      );
    } catch (_) { /* silently ignore */ }
  }

  async trackShipment(trackingNumber: string): Promise<ServiceResponse<Shipment>> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingNumber },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return {
      success: true,
      message: 'Shipment tracking info retrieved',
      data: shipment,
    };
  }

  // ==================== UTILITIES ====================

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.orderRepository.count();
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<ServiceResponse<Order[]>> {
    return this.findAll({ userId, page, limit });
  }

  async getSellerOrders(sellerId: string, page: number = 1, limit: number = 10): Promise<ServiceResponse<Order[]>> {
    return this.findAll({ sellerId, page, limit });
  }
}
