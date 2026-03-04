import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { DisputeStatus, DisputeResolution } from '@common/enums';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateDisputeEvidenceDto } from './dto/create-dispute-evidence.dto';
import { CreateDisputeMessageDto } from './dto/create-dispute-message.dto';

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DisputesController extends BaseController {
  constructor(private readonly disputesService: DisputesService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create dispute' })
  @ApiResponse({ status: 201, description: 'Dispute created' })
  create(@Body() dto: CreateDisputeDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.disputesService.create(dto, user.id));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all disputes' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: DisputeStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Permissions('disputes.read')
  findAll(
    @Query('customerId') customerId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: DisputeStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.disputesService.findAll({ customerId, orderId, status, page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.disputesService.findOne(id));
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update dispute status' })
  @Permissions('disputes.update')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: DisputeStatus; resolution?: DisputeResolution },
  ) {
    return this.handleAsyncOperation(
      this.disputesService.updateStatus(id, body.status, body.resolution),
    );
  }

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Add evidence to dispute' })
  addEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDisputeEvidenceDto,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.disputesService.addEvidence(id, dto, user.id));
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get dispute messages' })
  getMessages(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.disputesService.getMessages(id));
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add message to dispute' })
  addMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDisputeMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.disputesService.addMessage(id, dto, user.id));
  }
}
