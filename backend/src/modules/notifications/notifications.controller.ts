import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  UpdateNotificationPreferenceDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController extends BaseController {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('isRead') isRead?: boolean,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.notificationsService.findAll(user.id, { isRead, type, page, limit }),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.notificationsService.getUnreadCount(user.id),
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.notificationsService.markAsRead(id, user.id),
    );
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.notificationsService.markAllAsRead(user.id),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.notificationsService.remove(id, user.id),
    );
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  getPreferences(@CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.notificationsService.getPreferences(user.id),
    );
  }

  @Patch('preferences/:type')
  @ApiOperation({ summary: 'Update notification preference' })
  updatePreference(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.handleAsyncOperation(
      this.notificationsService.updatePreference(user.id, type, dto),
    );
  }
}

@ApiTags('Notification Templates')
@Controller('notification-templates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationTemplatesController extends BaseController {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get notification templates' })
  @Permissions('notifications.read')
  findAll() {
    return this.handleAsyncOperation(this.notificationsService.getTemplates());
  }

  @Post()
  @ApiOperation({ summary: 'Create notification template' })
  @Permissions('notifications.create')
  create(@Body() dto: CreateNotificationTemplateDto) {
    return this.handleAsyncOperation(
      this.notificationsService.createTemplate(dto),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification template' })
  @Permissions('notifications.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    return this.handleAsyncOperation(
      this.notificationsService.updateTemplate(id, dto),
    );
  }
}
