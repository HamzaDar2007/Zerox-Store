import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderWithItemsDto } from './dto/create-order-with-items.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order with items' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        order: { $ref: '#/components/schemas/CreateOrderDto' },
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/CreateOrderItemDto' },
        },
      },
      required: ['order', 'items'],
    },
  })
  @ApiResponse({ status: 201, description: 'Order created' })
  @Auditable({ action: 'CREATE', tableName: 'orders' })
  create(@Body() dto: CreateOrderWithItemsDto, @CurrentUser() user: any) {
    return this.svc.create({ ...dto.order, userId: user.id }, dto.items);
  }

  @Get()
  @ApiOperation({
    summary: 'List orders (own orders for customers, all for admin)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Orders list returned' })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    return this.svc.findAll({
      userId: isAdmin ? undefined : user.id,
      status,
      page: page ? Math.max(1, +page) : undefined,
      limit: limit ? Math.min(Math.max(1, +limit), 100) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findOne(id, user.id, user.role);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get order items' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order items returned' })
  findItems(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findItems(id, user.id, user.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @Auditable({ action: 'UPDATE_STATUS', tableName: 'orders' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.svc.updateStatus(id, dto.status);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @Auditable({ action: 'CANCEL', tableName: 'orders' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.cancelOrder(id, user.id, user.role);
  }
}
