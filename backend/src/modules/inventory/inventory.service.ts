import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Warehouse } from './entities/warehouse.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockReservation } from './entities/stock-reservation.entity';
import { InventoryTransfer } from './entities/inventory-transfer.entity';
import { InventoryTransferItem } from './entities/inventory-transfer-item.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateInventoryTransferDto } from './dto/create-inventory-transfer.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import {
  TransferStatus,
  ReservationStatus,
  StockMovementType,
} from '@common/enums';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(StockMovement)
    private movementRepository: Repository<StockMovement>,
    @InjectRepository(StockReservation)
    private reservationRepository: Repository<StockReservation>,
    @InjectRepository(InventoryTransfer)
    private transferRepository: Repository<InventoryTransfer>,
    @InjectRepository(InventoryTransferItem)
    private transferItemRepository: Repository<InventoryTransferItem>,
    private dataSource: DataSource,
  ) {}

  // ==================== WAREHOUSE CRUD ====================

  async createWarehouse(
    dto: CreateWarehouseDto,
  ): Promise<ServiceResponse<Warehouse>> {
    const warehouse = new Warehouse();
    Object.assign(warehouse, dto);
    const saved = await this.warehouseRepository.save(warehouse);
    return { success: true, message: 'Warehouse created', data: saved };
  }

  async findAllWarehouses(
    sellerId?: string,
  ): Promise<ServiceResponse<Warehouse[]>> {
    const query = this.warehouseRepository.createQueryBuilder('warehouse');
    if (sellerId) query.where('warehouse.sellerId = :sellerId', { sellerId });
    const warehouses = await query.orderBy('warehouse.name', 'ASC').getMany();
    return { success: true, message: 'Warehouses retrieved', data: warehouses };
  }

  async findOneWarehouse(id: string): Promise<ServiceResponse<Warehouse>> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['inventory'],
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return { success: true, message: 'Warehouse retrieved', data: warehouse };
  }

  async updateWarehouse(
    id: string,
    dto: UpdateWarehouseDto,
  ): Promise<ServiceResponse<Warehouse>> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    Object.assign(warehouse, dto);
    const updated = await this.warehouseRepository.save(warehouse);
    return { success: true, message: 'Warehouse updated', data: updated };
  }

  async deleteWarehouse(id: string): Promise<ServiceResponse<void>> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    const hasInventory = await this.inventoryRepository.count({
      where: { warehouseId: id },
    });
    if (hasInventory > 0)
      throw new BadRequestException('Cannot delete warehouse with inventory');
    await this.warehouseRepository.remove(warehouse);
    return { success: true, message: 'Warehouse deleted', data: undefined };
  }

  async removeWarehouse(id: string): Promise<ServiceResponse<void>> {
    return this.deleteWarehouse(id);
  }

  async getWarehouseInventory(
    warehouseId: string,
  ): Promise<ServiceResponse<Inventory[]>> {
    const inventory = await this.inventoryRepository.find({
      where: { warehouseId },
      relations: ['product', 'productVariant'],
    });
    return {
      success: true,
      message: 'Warehouse inventory retrieved',
      data: inventory,
    };
  }

  // ==================== INVENTORY ====================

  async getInventory(
    productId: string,
    warehouseId?: string,
  ): Promise<ServiceResponse<Inventory[]>> {
    const query = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .leftJoinAndSelect('inv.productVariant', 'variant')
      .where('inv.productId = :productId', { productId });
    if (warehouseId)
      query.andWhere('inv.warehouseId = :warehouseId', { warehouseId });
    const inventory = await query.getMany();
    return { success: true, message: 'Inventory retrieved', data: inventory };
  }

  async getProductInventory(
    productId: string,
    variantId?: string,
  ): Promise<ServiceResponse<Inventory[]>> {
    const query = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.productId = :productId', { productId });
    if (variantId)
      query.andWhere('inv.productVariantId = :variantId', { variantId });
    const inventory = await query.getMany();
    return {
      success: true,
      message: 'Product inventory retrieved',
      data: inventory,
    };
  }

  async setStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    productVariantId?: string,
  ): Promise<ServiceResponse<Inventory>> {
    let inventory = await this.inventoryRepository.findOne({
      where: {
        productId,
        warehouseId,
        productVariantId: productVariantId || null,
      },
    });
    if (!inventory) {
      inventory = new Inventory();
      inventory.productId = productId;
      inventory.warehouseId = warehouseId;
      inventory.productVariantId = productVariantId || null;
      inventory.quantityOnHand = 0;
      inventory.quantityReserved = 0;
      inventory.quantityAvailable = 0;
    }
    inventory.quantityOnHand = quantity;
    inventory.quantityAvailable = quantity - (inventory.quantityReserved || 0);
    const saved = await this.inventoryRepository.save(inventory);
    return { success: true, message: 'Stock set', data: saved };
  }

  async adjustStock(
    productId: string,
    warehouseId: string,
    adjustment: number,
    reason?: string,
    createdBy?: string,
    productVariantId?: string,
  ): Promise<ServiceResponse<Inventory>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let inventory = await queryRunner.manager.findOne(Inventory, {
        where: {
          productId,
          warehouseId,
          productVariantId: productVariantId || null,
        },
      });
      if (!inventory) {
        inventory = new Inventory();
        inventory.productId = productId;
        inventory.warehouseId = warehouseId;
        inventory.productVariantId = productVariantId || null;
        inventory.quantityOnHand = 0;
        inventory.quantityReserved = 0;
        inventory.quantityAvailable = 0;
      }
      inventory.quantityOnHand += adjustment;
      inventory.quantityAvailable += adjustment;
      if (inventory.quantityOnHand < 0 || inventory.quantityAvailable < 0) {
        throw new BadRequestException('Insufficient stock for adjustment');
      }
      await queryRunner.manager.save(inventory);
      const movement = new StockMovement();
      movement.inventoryId = inventory.id;
      movement.quantity = adjustment;
      movement.type =
        adjustment > 0
          ? StockMovementType.ADJUSTMENT_ADD
          : StockMovementType.ADJUSTMENT_SUBTRACT;
      movement.quantityBefore = inventory.quantityOnHand - adjustment;
      movement.quantityAfter = inventory.quantityOnHand;
      movement.note = reason || null;
      movement.createdBy = createdBy || null;
      await queryRunner.manager.save(movement);
      await queryRunner.commitTransaction();
      return { success: true, message: 'Stock adjusted', data: inventory };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getStockMovements(
    inventoryId: string,
    page = 1,
    limit = 50,
  ): Promise<ServiceResponse<StockMovement[]>> {
    const movements = await this.movementRepository.find({
      where: { inventoryId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      success: true,
      message: 'Stock movements retrieved',
      data: movements,
    };
  }

  async getMovementHistory(
    productId: string,
    warehouseId?: string,
    page = 1,
    limit = 50,
  ): Promise<ServiceResponse<StockMovement[]>> {
    // Guard against NaN from transform:true pipe
    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(limit) || limit < 1) limit = 50;

    const query = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoin('movement.inventory', 'inventory')
      .where('inventory.productId = :productId', { productId });
    if (warehouseId)
      query.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
    const movements = await query
      .orderBy('movement.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return {
      success: true,
      message: 'Movement history retrieved',
      data: movements,
    };
  }

  async createMovement(
    dto: CreateStockMovementDto,
    createdBy: string,
  ): Promise<ServiceResponse<StockMovement>> {
    const movement = new StockMovement();
    Object.assign(movement, dto);
    movement.createdBy = createdBy;
    const saved = await this.movementRepository.save(movement);
    return { success: true, message: 'Movement recorded', data: saved };
  }

  async getTransfers(
    warehouseId?: string,
  ): Promise<ServiceResponse<InventoryTransfer[]>> {
    const query = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('transfer.toWarehouse', 'toWarehouse')
      .orderBy('transfer.createdAt', 'DESC');
    if (warehouseId) {
      query.where(
        'transfer.fromWarehouseId = :warehouseId OR transfer.toWarehouseId = :warehouseId',
        { warehouseId },
      );
    }
    const transfers = await query.getMany();
    return { success: true, message: 'Transfers retrieved', data: transfers };
  }

  async getLowStockItems(
    warehouseId?: string,
  ): Promise<ServiceResponse<Inventory[]>> {
    const query = this.inventoryRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .where('inv.quantityAvailable <= inv.lowStockThreshold');
    if (warehouseId)
      query.andWhere('inv.warehouseId = :warehouseId', { warehouseId });
    const inventory = await query.getMany();
    return {
      success: true,
      message: 'Low stock items retrieved',
      data: inventory,
    };
  }

  // ==================== RESERVATIONS ====================

  async reserveStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    orderId: string,
    productVariantId?: string,
  ): Promise<ServiceResponse<StockReservation>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: {
          productId,
          warehouseId,
          productVariantId: productVariantId || null,
        },
      });
      if (!inventory || inventory.quantityAvailable < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      inventory.quantityReserved = (inventory.quantityReserved || 0) + quantity;
      inventory.quantityAvailable -= quantity;
      await queryRunner.manager.save(inventory);
      const reservation = new StockReservation();
      reservation.inventoryId = inventory.id;
      reservation.productId = productId;
      reservation.orderId = orderId;
      reservation.quantity = quantity;
      reservation.status = ReservationStatus.HELD;
      reservation.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      await queryRunner.manager.save(reservation);
      await queryRunner.commitTransaction();
      return { success: true, message: 'Stock reserved', data: reservation };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseReservation(
    reservationId: string,
  ): Promise<ServiceResponse<void>> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.status !== ReservationStatus.HELD) {
      throw new BadRequestException('Reservation cannot be released');
    }
    const inventory = await this.inventoryRepository.findOne({
      where: { id: reservation.inventoryId },
    });
    if (inventory) {
      inventory.quantityReserved -= reservation.quantity;
      inventory.quantityAvailable += reservation.quantity;
      await this.inventoryRepository.save(inventory);
    }
    reservation.status = ReservationStatus.RELEASED;
    await this.reservationRepository.save(reservation);
    return { success: true, message: 'Reservation released', data: undefined };
  }

  async commitReservation(
    reservationId: string,
  ): Promise<ServiceResponse<void>> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.status !== ReservationStatus.HELD) {
      throw new BadRequestException('Reservation cannot be committed');
    }
    const inventory = await this.inventoryRepository.findOne({
      where: { id: reservation.inventoryId },
    });
    if (inventory) {
      inventory.quantityOnHand -= reservation.quantity;
      inventory.quantityReserved -= reservation.quantity;
      await this.inventoryRepository.save(inventory);
    }
    reservation.status = ReservationStatus.COMMITTED;
    await this.reservationRepository.save(reservation);
    return { success: true, message: 'Reservation committed', data: undefined };
  }

  async releaseReservationsByOrderId(orderId: string): Promise<void> {
    const reservations = await this.reservationRepository.find({
      where: { orderId, status: ReservationStatus.HELD },
    });
    for (const reservation of reservations) {
      await this.releaseReservation(reservation.id);
    }
  }

  async commitReservationsByOrderId(orderId: string): Promise<void> {
    const reservations = await this.reservationRepository.find({
      where: { orderId, status: ReservationStatus.HELD },
    });
    for (const reservation of reservations) {
      await this.commitReservation(reservation.id);
    }
  }

  // ==================== TRANSFERS ====================

  async createTransfer(
    dto: CreateInventoryTransferDto,
    initiatedBy: string,
  ): Promise<ServiceResponse<InventoryTransfer>> {
    const transferNumber = await this.generateTransferNumber();
    const transfer = new InventoryTransfer();
    Object.assign(transfer, dto);
    transfer.transferNumber = transferNumber;
    transfer.initiatedBy = initiatedBy;
    transfer.status = TransferStatus.PENDING;
    const saved = await this.transferRepository.save(transfer);
    return { success: true, message: 'Transfer created', data: saved };
  }

  async findAllTransfers(options?: {
    fromWarehouseId?: string;
    toWarehouseId?: string;
    status?: TransferStatus;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<InventoryTransfer[]>> {
    const query = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('transfer.toWarehouse', 'toWarehouse')
      .leftJoinAndSelect('transfer.items', 'items')
      .orderBy('transfer.createdAt', 'DESC');
    if (options?.fromWarehouseId)
      query.andWhere('transfer.fromWarehouseId = :fromWarehouseId', {
        fromWarehouseId: options.fromWarehouseId,
      });
    if (options?.toWarehouseId)
      query.andWhere('transfer.toWarehouseId = :toWarehouseId', {
        toWarehouseId: options.toWarehouseId,
      });
    if (options?.status)
      query.andWhere('transfer.status = :status', { status: options.status });
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    const [transfers, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Transfers retrieved',
      data: transfers,
      meta: { total, page, limit },
    };
  }

  async findOneTransfer(
    id: string,
  ): Promise<ServiceResponse<InventoryTransfer>> {
    const transfer = await this.transferRepository.findOne({
      where: { id },
      relations: [
        'fromWarehouse',
        'toWarehouse',
        'items',
        'items.product',
        'items.productVariant',
        'initiator',
        'approver',
      ],
    });
    if (!transfer) throw new NotFoundException('Transfer not found');
    return { success: true, message: 'Transfer retrieved', data: transfer };
  }

  async approveTransfer(
    id: string,
    approvedBy: string,
  ): Promise<ServiceResponse<InventoryTransfer>> {
    const transfer = await this.transferRepository.findOne({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Transfer cannot be approved');
    }
    transfer.status = TransferStatus.APPROVED;
    transfer.approvedBy = approvedBy;
    transfer.approvedAt = new Date();
    const updated = await this.transferRepository.save(transfer);
    return { success: true, message: 'Transfer approved', data: updated };
  }

  async completeTransfer(
    id: string,
  ): Promise<ServiceResponse<InventoryTransfer>> {
    const transfer = await this.transferRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (
      transfer.status !== TransferStatus.IN_TRANSIT &&
      transfer.status !== TransferStatus.APPROVED
    ) {
      throw new BadRequestException('Transfer cannot be completed');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const item of transfer.items) {
        // Deduct from source warehouse
        const sourceInv = await queryRunner.manager.findOne(Inventory, {
          where: {
            productId: item.productId,
            warehouseId: transfer.fromWarehouseId,
            productVariantId: item.productVariantId,
          },
        });
        if (sourceInv) {
          sourceInv.quantityOnHand -= item.quantityRequested;
          sourceInv.quantityAvailable -= item.quantityRequested;
          await queryRunner.manager.save(sourceInv);
        }
        // Add to destination warehouse
        let destInv = await queryRunner.manager.findOne(Inventory, {
          where: {
            productId: item.productId,
            warehouseId: transfer.toWarehouseId,
            productVariantId: item.productVariantId,
          },
        });
        if (!destInv) {
          destInv = new Inventory();
          destInv.productId = item.productId;
          destInv.warehouseId = transfer.toWarehouseId;
          destInv.productVariantId = item.productVariantId;
          destInv.quantityOnHand = 0;
          destInv.quantityReserved = 0;
          destInv.quantityAvailable = 0;
        }
        destInv.quantityOnHand += item.quantityRequested;
        destInv.quantityAvailable += item.quantityRequested;
        await queryRunner.manager.save(destInv);
      }
      transfer.status = TransferStatus.COMPLETED;
      transfer.receivedAt = new Date();
      await queryRunner.manager.save(transfer);
      await queryRunner.commitTransaction();
      return { success: true, message: 'Transfer completed', data: transfer };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateTransferNumber(): Promise<string> {
    const count = await this.transferRepository.count();
    return `TRF${String(count + 1).padStart(8, '0')}`;
  }
}
