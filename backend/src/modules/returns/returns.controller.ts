import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiBody,
} from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnWithItemsDto } from './dto/create-return-with-items.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Returns')
@Controller('returns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ReturnsController {
  constructor(private readonly svc: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a return request with items' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        return: { $ref: '#/components/schemas/CreateReturnRequestDto' },
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/CreateReturnItemDto' },
        },
      },
      required: ['return'],
    },
  })
  @ApiResponse({ status: 201, description: 'Return request created' })
  @Auditable({ action: 'CREATE', tableName: 'return_requests' })
  create(@Body() dto: CreateReturnWithItemsDto, @CurrentUser() user: any) {
    return this.svc.create({ ...dto.return, userId: user.id }, dto.items);
  }

  @Get()
  @ApiOperation({
    summary: 'List return requests (own for customers, all for admin)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Returns list returned' })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    return this.svc.findAll({
      userId: isAdmin ? undefined : user.id,
      status,
      page: +(page || 1),
      limit: +(limit || 50),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get return request by ID' })
  @ApiParam({ name: 'id', description: 'Return request UUID' })
  @ApiResponse({ status: 200, description: 'Return request found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findOne(id, user.id, user.role);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get items in a return request' })
  @ApiParam({ name: 'id', description: 'Return request UUID' })
  @ApiResponse({ status: 200, description: 'Return items returned' })
  findItems(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findItems(id, user.id, user.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update return request status (Admin)' })
  @ApiParam({ name: 'id', description: 'Return request UUID' })
  @ApiResponse({ status: 200, description: 'Return status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReturnRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateStatus(id, dto.status, user.id, dto.refundAmount);
  }
}
