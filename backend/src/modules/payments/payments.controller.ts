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
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a payment record (Admin only)' })
  @ApiResponse({ status: 201, description: 'Payment created' })
  @Auditable({ action: 'CREATE', tableName: 'payments' })
  create(@Body() dto: CreatePaymentDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments (own for customers, all for admin)' })
  @ApiQuery({
    name: 'orderId',
    required: false,
    type: String,
    description: 'Filter by order UUID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50)',
  })
  @ApiResponse({ status: 200, description: 'Payments list returned' })
  findAll(
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    return this.svc.findAll({
      orderId,
      userId: isAdmin ? undefined : user.id,
      status,
      page: +(page || 1),
      limit: +(limit || 50),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findOne(id, user.id, user.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update payment status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  @Auditable({ action: 'UPDATE_STATUS', tableName: 'payments' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.svc.updateStatus(id, dto.status, dto.gatewayTxId);
  }
}
