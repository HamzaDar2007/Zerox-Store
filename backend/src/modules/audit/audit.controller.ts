import {
  Controller,
  Get,
  Post,
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
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Post()
  @ApiOperation({ summary: 'Create an audit log entry (Admin only)' })
  @ApiResponse({ status: 201, description: 'Audit log created' })
  create(@Body() dto: CreateAuditLogDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List audit logs with filters (Admin only)' })
  @ApiQuery({
    name: 'actorId',
    required: false,
    type: String,
    description: 'Filter by actor UUID',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    type: String,
    description: 'Filter by action',
  })
  @ApiQuery({
    name: 'tableName',
    required: false,
    type: String,
    description: 'Filter by table',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Audit logs returned' })
  findAll(
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('tableName') tableName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      actorId,
      action,
      tableName,
      page: page ? Math.max(1, +page) : undefined,
      limit: limit ? Math.min(Math.max(1, +limit), 100) : undefined,
    });
  }

  @Get('entity/:tableName/:recordId')
  @ApiOperation({
    summary: 'Get audit logs for a specific entity (Admin only)',
  })
  @ApiParam({ name: 'tableName', description: 'Database table name' })
  @ApiParam({ name: 'recordId', description: 'Record UUID' })
  @ApiResponse({ status: 200, description: 'Entity audit logs returned' })
  findByEntity(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ) {
    return this.svc.findByEntity(tableName, recordId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Audit log UUID' })
  @ApiResponse({ status: 200, description: 'Audit log found' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
}
