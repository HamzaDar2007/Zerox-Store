import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, CreateTicketMessageDto, CreateTicketCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { TicketStatus, TicketPriority } from '@common/enums';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TicketsController extends BaseController {
  constructor(private readonly ticketsService: TicketsService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create ticket' })
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.ticketsService.create(user.id, dto));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'priority', required: false, enum: TicketPriority })
  @Permissions('tickets.read')
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(this.ticketsService.findAll({ userId, status, priority, page, limit }));
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Get my tickets' })
  getMyTickets(@CurrentUser() user: User, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.handleAsyncOperation(this.ticketsService.findAll({ userId: user.id, page, limit }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.ticketsService.findOne(id, user.id, user.role));
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update ticket' })
  @Permissions('tickets.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTicketDto) {
    return this.handleAsyncOperation(this.ticketsService.update(id, dto));
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update ticket status' })
  @Permissions('tickets.update')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: TicketStatus) {
    return this.handleAsyncOperation(this.ticketsService.updateStatus(id, status));
  }

  @Patch(':id/assign')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Assign ticket' })
  @Permissions('tickets.update')
  assign(@Param('id', ParseUUIDPipe) id: string, @Body('assignedToId') assignedToId: string) {
    return this.handleAsyncOperation(this.ticketsService.assignTicket(id, assignedToId));
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add message to ticket' })
  addMessage(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateTicketMessageDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.ticketsService.addMessage(id, user.id, dto));
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get ticket messages' })
  getMessages(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.ticketsService.getMessages(id));
  }

  @Get('categories/all')
  @ApiOperation({ summary: 'Get ticket categories' })
  getCategories() {
    return this.handleAsyncOperation(this.ticketsService.getCategories());
  }

  @Post('categories')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create ticket category' })
  @Permissions('tickets.create')
  createCategory(@Body() dto: CreateTicketCategoryDto) {
    return this.handleAsyncOperation(this.ticketsService.createCategory(dto));
  }
}
