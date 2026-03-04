import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OperationsService } from './operations.service';
import { CreateBulkOperationDto } from './dto/create-bulk-operation.dto';
import { CreateImportExportJobDto } from './dto/create-import-export-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Operations - Bulk')
@Controller('operations/bulk')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class BulkOperationsController extends BaseController {
  constructor(private readonly operationsService: OperationsService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create bulk operation' })
  @Permissions('operations.create')
  create(@Body() dto: CreateBulkOperationDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.operationsService.createBulkOperation(user.id, dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all bulk operations' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'operationType', required: false })
  @Permissions('operations.read')
  findAll(
    @Query('status') status?: string,
    @Query('operationType') operationType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(this.operationsService.findAllBulkOperations({ status, operationType, page, limit }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bulk operation by ID' })
  @Permissions('operations.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.operationsService.findBulkOperation(id));
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update bulk operation progress' })
  @Permissions('operations.update')
  updateProgress(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { successCount: number; failureCount?: number }) {
    return this.handleAsyncOperation(this.operationsService.updateBulkOperationProgress(id, dto.successCount, dto.failureCount));
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel bulk operation' })
  @Permissions('operations.update')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.operationsService.cancelBulkOperation(id));
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Mark bulk operation as failed' })
  @Permissions('operations.update')
  fail(@Param('id', ParseUUIDPipe) id: string, @Body('errorLog') errorLog: Record<string, any>[]) {
    return this.handleAsyncOperation(this.operationsService.failBulkOperation(id, errorLog || []));
  }
}

@ApiTags('Operations - Import/Export')
@Controller('operations/jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ImportExportController extends BaseController {
  constructor(private readonly operationsService: OperationsService) { super(); }

  @Post()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create import/export job' })
  @Permissions('operations.create')
  create(@Body() dto: CreateImportExportJobDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.operationsService.createImportExportJob(user.id, dto));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all import/export jobs' })
  @ApiQuery({ name: 'type', required: false, enum: ['import', 'export'] })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @Permissions('operations.read')
  findAll(
    @Query('type') type?: 'import' | 'export',
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(this.operationsService.findAllImportExportJobs({ type, status, userId, page, limit }));
  }

  @Get('my-jobs')
  @ApiOperation({ summary: 'Get my import/export jobs' })
  getMyJobs(@CurrentUser() user: User, @Query('jobType') jobType?: 'import' | 'export') {
    return this.handleAsyncOperation(this.operationsService.getMyJobs(user.id, jobType));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import/export job by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.operationsService.findImportExportJob(id));
  }

  @Patch(':id/progress')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update job progress' })
  @Permissions('operations.update')
  updateProgress(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { processedRows: number; successRows?: number; failedRows?: number }) {
    return this.handleAsyncOperation(this.operationsService.updateJobProgress(id, dto.processedRows, dto.successRows || 0, dto.failedRows || 0));
  }

  @Post(':id/complete')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Mark job as completed' })
  @Permissions('operations.update')
  complete(@Param('id', ParseUUIDPipe) id: string, @Body('resultFileUrl') resultFileUrl?: string) {
    return this.handleAsyncOperation(this.operationsService.completeJob(id, resultFileUrl));
  }

  @Post(':id/fail')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Mark job as failed' })
  @Permissions('operations.update')
  fail(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { errorMessage: string; errorDetails?: any }) {
    return this.handleAsyncOperation(this.operationsService.failJob(id, dto.errorMessage, dto.errorDetails));
  }
}
