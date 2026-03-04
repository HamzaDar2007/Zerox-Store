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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { OrderStatus, ShipmentStatus } from '@common/enums';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController extends BaseController {
  constructor(private readonly ordersService: OrdersService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.ordersService.create(dto, user.id));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Permissions('orders.read')
  findAll(
    @Query('userId') userId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.ordersService.findAll({ userId, sellerId, status, page, limit }),
    );
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyOrders(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(this.ordersService.getUserOrders(user.id, page, limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.ordersService.findOne(id));
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.handleAsyncOperation(this.ordersService.findByOrderNumber(orderNumber));
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @Permissions('orders.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderDto) {
    return this.handleAsyncOperation(this.ordersService.update(id, dto));
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update order status' })
  @Permissions('orders.update')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: OrderStatus; comment: string },
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.ordersService.updateStatus(id, body.status, body.comment, user.id),
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.ordersService.cancel(id, reason, user.id));
  }

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Get order status history' })
  getStatusHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.ordersService.getStatusHistory(id));
  }

  // ==================== SHIPMENTS ====================

  @Post(':orderId/shipments')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create shipment for order' })
  @Permissions('orders.update')
  createShipment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.handleAsyncOperation(this.ordersService.createShipment(orderId, dto));
  }

  @Get(':orderId/shipments')
  @ApiOperation({ summary: 'Get order shipments' })
  getShipments(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.handleAsyncOperation(this.ordersService.getShipments(orderId));
  }
}

@ApiTags('Shipments')
@Controller('shipments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ShipmentsController extends BaseController {
  constructor(private readonly ordersService: OrdersService) {
    super();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipment' })
  @Permissions('orders.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateShipmentDto) {
    return this.handleAsyncOperation(this.ordersService.updateShipment(id, dto));
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update shipment status' })
  @Permissions('orders.update')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ShipmentStatus,
  ) {
    return this.handleAsyncOperation(this.ordersService.updateShipmentStatus(id, status));
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Track shipment by tracking number' })
  track(@Param('trackingNumber') trackingNumber: string) {
    return this.handleAsyncOperation(this.ordersService.trackShipment(trackingNumber));
  }
}
