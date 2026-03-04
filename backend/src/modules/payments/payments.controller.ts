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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { CreateSavedPaymentMethodDto } from './dto/create-saved-payment-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { PaymentStatus, RefundStatus } from '@common/enums';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController extends BaseController {
  constructor(private readonly paymentsService: PaymentsService) {
    super();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @Permissions('payments.create')
  create(@Body() dto: CreatePaymentDto) {
    return this.handleAsyncOperation(this.paymentsService.createPayment(dto));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Permissions('payments.read')
  findAll(
    @Query('orderId') orderId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.paymentsService.findAllPayments({ orderId, userId, status, page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.paymentsService.findOnePayment(id));
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @Permissions('payments.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePaymentDto) {
    return this.handleAsyncOperation(this.paymentsService.updatePayment(id, dto));
  }

  @Post(':id/process')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Process payment' })
  @Permissions('payments.update')
  processPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentData: any,
  ) {
    return this.handleAsyncOperation(this.paymentsService.processPayment(id, paymentData));
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get payment attempts' })
  getAttempts(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.paymentsService.getPaymentAttempts(id));
  }
}

@ApiTags('Refunds')
@Controller('refunds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RefundsController extends BaseController {
  constructor(private readonly paymentsService: PaymentsService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Request refund' })
  @ApiResponse({ status: 201, description: 'Refund request created' })
  create(@Body() dto: CreateRefundDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.paymentsService.createRefund(dto, user.id));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all refunds' })
  @ApiQuery({ name: 'paymentId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: RefundStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Permissions('payments.read')
  findAll(
    @Query('paymentId') paymentId?: string,
    @Query('status') status?: RefundStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.paymentsService.findAllRefunds({ paymentId, status, page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.paymentsService.findOneRefund(id));
  }

  @Post(':id/process')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Process refund' })
  @Permissions('payments.update')
  processRefund(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.paymentsService.processRefund(id));
  }

  @Post(':id/reject')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Reject refund' })
  @Permissions('payments.update')
  rejectRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.handleAsyncOperation(this.paymentsService.rejectRefund(id, reason));
  }
}

@ApiTags('Payment Methods')
@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentMethodsController extends BaseController {
  constructor(private readonly paymentsService: PaymentsService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Save payment method' })
  @ApiResponse({ status: 201, description: 'Payment method saved' })
  create(@Body() dto: CreateSavedPaymentMethodDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.paymentsService.savePaymentMethod(user.id, dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get saved payment methods' })
  findAll(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.paymentsService.getSavedPaymentMethods(user.id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment method' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.paymentsService.deleteSavedPaymentMethod(id, user.id));
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Set default payment method' })
  setDefault(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.paymentsService.setDefaultPaymentMethod(id, user.id));
  }
}
