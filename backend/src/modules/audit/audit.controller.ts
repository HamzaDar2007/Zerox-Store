import {
  Controller,
  Get,
  Post,
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
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Audit - Logs')
@Controller('audit/logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class AuditLogsController extends BaseController {
  constructor(private readonly auditService: AuditService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @Permissions('audit.read')
  findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.auditService.findAllAuditLogs({
        userId,
        action,
        entityType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page,
        limit,
      }),
    );
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get entity audit history' })
  @Permissions('audit.read')
  getEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.handleAsyncOperation(
      this.auditService.getEntityHistory(entityType, entityId),
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user audit activity' })
  @Permissions('audit.read')
  getUserActivity(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.handleAsyncOperation(
      this.auditService.getUserActivity(
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @Permissions('audit.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.auditService.findAuditLog(id));
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup old audit logs' })
  @Permissions('audit.delete')
  cleanup(@Body('daysToKeep') daysToKeep?: number) {
    return this.handleAsyncOperation(
      this.auditService.cleanupOldLogs(daysToKeep),
    );
  }
}

@ApiTags('Audit - Activity')
@Controller('audit/activity')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ActivityLogsController extends BaseController {
  constructor(private readonly auditService: AuditService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all activity logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'activityType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @Permissions('audit.read')
  findAll(
    @Query('userId') userId?: string,
    @Query('activityType') activityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.auditService.findAllActivityLogs({
        userId,
        activityType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page,
        limit,
      }),
    );
  }

  @Get('my-activity')
  @ApiOperation({ summary: 'Get my activity summary' })
  getMyActivity(@CurrentUser() user: User, @Query('days') days?: number) {
    return this.handleAsyncOperation(
      this.auditService.getActivitySummary(user.id, days),
    );
  }

  @Get('user/:userId/summary')
  @ApiOperation({ summary: 'Get user activity summary' })
  @Permissions('audit.read')
  getUserSummary(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('days') days?: number,
  ) {
    return this.handleAsyncOperation(
      this.auditService.getActivitySummary(userId, days),
    );
  }
}
