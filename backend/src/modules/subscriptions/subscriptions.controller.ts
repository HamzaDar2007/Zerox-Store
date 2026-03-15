import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class SubscriptionsController {
  constructor(private readonly svc: SubscriptionsService) {}

  @Post('plans')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a subscription plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Plan created' })
  @Auditable({ action: 'CREATE', tableName: 'subscription_plans' })
  createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.svc.createPlan(dto);
  }

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'List all subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans list returned' })
  findAllPlans() {
    return this.svc.findAllPlans();
  }

  @Get('plans/:id')
  @Public()
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiResponse({ status: 200, description: 'Plan found' })
  findPlan(@Param('id') id: string) {
    return this.svc.findPlan(id);
  }

  @Put('plans/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a subscription plan (Admin only)' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  updatePlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.svc.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a subscription plan (Admin only)' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiResponse({ status: 200, description: 'Plan deleted' })
  removePlan(@Param('id') id: string) {
    return this.svc.removePlan(id);
  }

  @Post()
  @ApiOperation({ summary: 'Subscribe to a plan' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  @Auditable({ action: 'SUBSCRIBE', tableName: 'subscriptions' })
  subscribe(@Body() dto: CreateSubscriptionDto, @CurrentUser() user: any) {
    return this.svc.subscribe({ ...dto, userId: user.id });
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get subscriptions for current user' })
  @ApiResponse({ status: 200, description: 'User subscriptions returned' })
  findMine(@CurrentUser() user: any) {
    return this.svc.findByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({ name: 'id', description: 'Subscription UUID' })
  @ApiResponse({ status: 200, description: 'Subscription found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findSubscription(id, user.id, user.role);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update subscription (Admin only)' })
  @ApiParam({ name: 'id', description: 'Subscription UUID' })
  @ApiResponse({ status: 200, description: 'Subscription updated' })
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.svc.updateSubscription(id, dto);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiParam({ name: 'id', description: 'Subscription UUID' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  @Auditable({ action: 'CANCEL', tableName: 'subscriptions' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.cancelSubscription(id, user.id, user.role);
  }
}
