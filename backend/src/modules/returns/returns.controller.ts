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
import { ReturnsService } from './returns.service';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { CreateReturnReasonDto } from './dto/create-return-reason.dto';
import { UpdateReturnReasonDto } from './dto/update-return-reason.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { ReturnStatus } from '@common/enums';

@ApiTags('Returns')
@Controller('returns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReturnsController extends BaseController {
  constructor(private readonly returnsService: ReturnsService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create return request' })
  @ApiResponse({ status: 201, description: 'Return request created' })
  create(@Body() dto: CreateReturnRequestDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.returnsService.createReturn(dto, user.id));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Get all returns' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ReturnStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Permissions('returns.read')
  findAll(
    @Query('userId') userId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: ReturnStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.returnsService.findAll({ userId, orderId, status, page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get return by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.returnsService.findOne(id));
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update return request' })
  @Permissions('returns.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReturnRequestDto) {
    return this.handleAsyncOperation(this.returnsService.updateReturn(id, dto));
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update return status' })
  @Permissions('returns.update')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: ReturnStatus; notes?: string },
  ) {
    return this.handleAsyncOperation(this.returnsService.updateStatus(id, body.status, body.notes));
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add image to return' })
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.handleAsyncOperation(this.returnsService.addReturnImage(id, imageUrl));
  }
}

@ApiTags('Return Reasons')
@Controller('return-reasons')
export class ReturnReasonsController extends BaseController {
  constructor(private readonly returnsService: ReturnsService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all return reasons' })
  findAll() {
    return this.handleAsyncOperation(this.returnsService.findAllReasons());
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create return reason' })
  @Permissions('returns.create')
  create(@Body() dto: CreateReturnReasonDto) {
    return this.handleAsyncOperation(this.returnsService.createReason(dto));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update return reason' })
  @Permissions('returns.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReturnReasonDto) {
    return this.handleAsyncOperation(this.returnsService.updateReason(id, dto));
  }
}
