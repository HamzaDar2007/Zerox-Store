import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { SetStockDto } from './dto/set-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';

@ApiTags('Warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class WarehousesController {
  constructor(private readonly svc: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a warehouse (Admin only)' })
  @ApiResponse({ status: 201, description: 'Warehouse created' })
  @Auditable({ action: 'CREATE', tableName: 'warehouses' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.svc.createWarehouse(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all warehouses (Admin only)' })
  @ApiResponse({ status: 200, description: 'Warehouses list returned' })
  findAll() {
    return this.svc.findAllWarehouses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({ status: 200, description: 'Warehouse found' })
  findOne(@Param('id') id: string) {
    return this.svc.findWarehouse(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a warehouse (Admin only)' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({ status: 200, description: 'Warehouse updated' })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.svc.updateWarehouse(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a warehouse (Admin only)' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted' })
  @Auditable({ action: 'DELETE', tableName: 'warehouses' })
  remove(@Param('id') id: string) {
    return this.svc.removeWarehouse(id);
  }
}

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Post('set')
  @ApiOperation({ summary: 'Set stock level for a variant at a warehouse' })
  @ApiResponse({ status: 200, description: 'Stock set' })
  setStock(@Body() dto: SetStockDto) {
    return this.svc.setStock(dto.warehouseId, dto.variantId, dto.qtyOnHand);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock by delta (positive or negative)' })
  @ApiResponse({ status: 200, description: 'Stock adjusted' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.svc.adjustStock(dto.warehouseId, dto.variantId, dto.delta);
  }

  @Post('reserve')
  @ApiOperation({ summary: 'Reserve stock for an order' })
  @ApiResponse({ status: 200, description: 'Stock reserved' })
  reserveStock(@Body() dto: AdjustStockDto) {
    return this.svc.reserveStock(dto.warehouseId, dto.variantId, dto.delta);
  }

  @Post('release')
  @ApiOperation({ summary: 'Release reserved stock' })
  @ApiResponse({ status: 200, description: 'Reservation released' })
  releaseReservation(@Body() dto: AdjustStockDto) {
    return this.svc.releaseReservation(
      dto.warehouseId,
      dto.variantId,
      dto.delta,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get inventory levels' })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    type: String,
    description: 'Filter by warehouse UUID',
  })
  @ApiQuery({
    name: 'variantId',
    required: false,
    type: String,
    description: 'Filter by variant UUID',
  })
  @ApiResponse({ status: 200, description: 'Inventory data returned' })
  getInventory(
    @Query('warehouseId') warehouseId?: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.svc.getInventory(warehouseId, variantId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  @ApiResponse({ status: 200, description: 'Low stock items returned' })
  getLowStock() {
    return this.svc.getLowStock();
  }
}
