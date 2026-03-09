import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SubscriptionsController extends BaseController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create subscription' })
  create(@Body() dto: CreateSubscriptionDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.subscriptionsService.create(user.id, dto),
    );
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiQuery({ name: 'status', required: false })
  @Permissions('subscriptions.read')
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.subscriptionsService.findAll({ status, page, limit }),
    );
  }

  @Get('my-subscriptions')
  @ApiOperation({ summary: 'Get my subscriptions' })
  getMySubscriptions(@CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.subscriptionsService.findByUser(user.id),
    );
  }

  @Get('due')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get due subscriptions' })
  @Permissions('subscriptions.read')
  getDueSubscriptions() {
    return this.handleAsyncOperation(
      this.subscriptionsService.getDueSubscriptions(),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.subscriptionsService.findOne(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionDto,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.subscriptionsService.update(id, dto, user.id),
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
    @CurrentUser() user?: User,
  ) {
    return this.handleAsyncOperation(
      this.subscriptionsService.cancel(id, reason, user?.id),
    );
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause subscription' })
  pause(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.subscriptionsService.pause(id, user.id),
    );
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume subscription' })
  resume(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.subscriptionsService.resume(id, user.id),
    );
  }

  @Post(':id/renew')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Process subscription renewal' })
  @Permissions('subscriptions.update')
  processRenewal(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.subscriptionsService.processRenewal(id),
    );
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get subscription orders' })
  getOrders(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.subscriptionsService.getOrders(id));
  }
}
