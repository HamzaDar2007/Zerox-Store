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
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateFlashSaleDto,
  CreateVoucherDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Campaigns')
@Controller('marketing/campaigns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class CampaignsController extends BaseController {
  constructor(private readonly marketingService: MarketingService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create campaign' })
  @Permissions('marketing.create')
  create(@Body() dto: CreateCampaignDto) {
    return this.handleAsyncOperation(this.marketingService.createCampaign(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Permissions('marketing.read')
  findAll(@Query('isActive') isActive?: boolean) {
    return this.handleAsyncOperation(
      this.marketingService.findAllCampaigns({ isActive }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @Permissions('marketing.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.marketingService.findOneCampaign(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign' })
  @Permissions('marketing.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.handleAsyncOperation(
      this.marketingService.updateCampaign(id, dto),
    );
  }
}

@ApiTags('Flash Sales')
@Controller('marketing/flash-sales')
export class FlashSalesController extends BaseController {
  constructor(private readonly marketingService: MarketingService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create flash sale' })
  @Permissions('marketing.create')
  create(@Body() dto: CreateFlashSaleDto) {
    return this.handleAsyncOperation(
      this.marketingService.createFlashSale(dto),
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active flash sales' })
  getActive() {
    return this.handleAsyncOperation(
      this.marketingService.getActiveFlashSales(),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flash sale by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.marketingService.findOneFlashSale(id),
    );
  }
}

@ApiTags('Vouchers')
@Controller('marketing/vouchers')
export class VouchersController extends BaseController {
  constructor(private readonly marketingService: MarketingService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create voucher' })
  @Permissions('marketing.create')
  create(@Body() dto: CreateVoucherDto) {
    return this.handleAsyncOperation(this.marketingService.createVoucher(dto));
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all vouchers' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Permissions('marketing.read')
  findAll(@Query('isActive') isActive?: boolean) {
    return this.handleAsyncOperation(
      this.marketingService.findAllVouchers({ isActive }),
    );
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get voucher by code' })
  findByCode(@Param('code') code: string) {
    return this.handleAsyncOperation(
      this.marketingService.findVoucherByCode(code),
    );
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Validate voucher' })
  validate(
    @Body() body: { code: string; orderTotal: number },
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.marketingService.validateVoucher(
        body.code,
        user.id,
        body.orderTotal,
      ),
    );
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply voucher to order' })
  apply(
    @Body() body: { code: string; orderId: string },
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.marketingService.applyVoucher(body.code, user.id, body.orderId),
    );
  }
}
