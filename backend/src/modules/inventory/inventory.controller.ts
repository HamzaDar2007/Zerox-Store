import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateInventoryTransferDto } from './dto/create-inventory-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class WarehousesController extends BaseController {
  constructor(private readonly inventoryService: InventoryService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  @Permissions('inventory.create')
  create(@Body() dto: CreateWarehouseDto) {
    return this.handleAsyncOperation(
      this.inventoryService.createWarehouse(dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({
    status: 200,
    description: 'Warehouses retrieved successfully',
  })
  @ApiQuery({ name: 'sellerId', required: false })
  @Permissions('inventory.read')
  findAll(@Query('sellerId') sellerId?: string) {
    return this.handleAsyncOperation(
      this.inventoryService.findAllWarehouses(sellerId),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiResponse({ status: 200, description: 'Warehouse retrieved successfully' })
  @Permissions('inventory.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.inventoryService.findOneWarehouse(id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  @Permissions('inventory.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.handleAsyncOperation(
      this.inventoryService.updateWarehouse(id, dto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted successfully' })
  @Permissions('inventory.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.inventoryService.removeWarehouse(id));
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get warehouse inventory' })
  @Permissions('inventory.read')
  getInventory(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.inventoryService.getWarehouseInventory(id),
    );
  }
}

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class InventoryController extends BaseController {
  constructor(private readonly inventoryService: InventoryService) {
    super();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product inventory across warehouses' })
  @ApiQuery({ name: 'variantId', required: false })
  @Permissions('inventory.read')
  getProductInventory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.handleAsyncOperation(
      this.inventoryService.getProductInventory(productId, variantId),
    );
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  @Permissions('inventory.update')
  adjustStock(
    @Body()
    body: {
      productId: string;
      warehouseId: string;
      adjustment: number;
      reason: string;
      variantId?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.inventoryService.adjustStock(
        body.productId,
        body.warehouseId,
        body.adjustment,
        body.reason,
        user.id,
        body.variantId,
      ),
    );
  }

  @Post('reserve')
  @ApiOperation({ summary: 'Reserve stock for order' })
  @Permissions('inventory.update')
  reserveStock(
    @Body()
    body: {
      productId: string;
      warehouseId: string;
      quantity: number;
      orderId: string;
      variantId?: string;
    },
  ) {
    return this.handleAsyncOperation(
      this.inventoryService.reserveStock(
        body.productId,
        body.warehouseId,
        body.quantity,
        body.orderId,
        body.variantId,
      ),
    );
  }

  @Post('release/:reservationId')
  @ApiOperation({ summary: 'Release stock reservation' })
  @Permissions('inventory.update')
  releaseReservation(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
  ) {
    return this.handleAsyncOperation(
      this.inventoryService.releaseReservation(reservationId),
    );
  }

  @Get('movements/:productId')
  @ApiOperation({ summary: 'Get stock movement history' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Permissions('inventory.read')
  getMovements(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.inventoryService.getMovementHistory(
        productId,
        warehouseId,
        page,
        limit,
      ),
    );
  }

  @Post('movements')
  @ApiOperation({ summary: 'Record stock movement' })
  @Permissions('inventory.update')
  createMovement(
    @Body() dto: CreateStockMovementDto,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.inventoryService.createMovement(dto, user.id),
    );
  }
}

@ApiTags('Inventory Transfers')
@Controller('inventory/transfers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class InventoryTransfersController extends BaseController {
  constructor(private readonly inventoryService: InventoryService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create inventory transfer' })
  @ApiResponse({ status: 201, description: 'Transfer created successfully' })
  @Permissions('inventory.create')
  create(@Body() dto: CreateInventoryTransferDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.inventoryService.createTransfer(dto, user.id),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all transfers' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @Permissions('inventory.read')
  findAll(@Query('warehouseId') warehouseId?: string) {
    return this.handleAsyncOperation(
      this.inventoryService.getTransfers(warehouseId),
    );
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete inventory transfer' })
  @Permissions('inventory.update')
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.inventoryService.completeTransfer(id),
    );
  }
}
