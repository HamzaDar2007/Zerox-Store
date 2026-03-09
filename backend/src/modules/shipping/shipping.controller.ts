import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  CreateShippingMethodDto,
  UpdateShippingMethodDto,
  CreateShippingCarrierDto,
  UpdateShippingCarrierDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
  CreateDeliverySlotDto,
} from './dto';

@ApiTags('Shipping Zones')
@Controller('shipping/zones')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ShippingZonesController extends BaseController {
  constructor(private readonly shippingService: ShippingService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create shipping zone' })
  @Permissions('shipping.create')
  create(@Body() dto: CreateShippingZoneDto) {
    return this.handleAsyncOperation(this.shippingService.createZone(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping zones' })
  @Permissions('shipping.read')
  findAll() {
    return this.handleAsyncOperation(this.shippingService.findAllZones());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipping zone by ID' })
  @Permissions('shipping.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.shippingService.findOneZone(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipping zone' })
  @Permissions('shipping.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShippingZoneDto,
  ) {
    return this.handleAsyncOperation(this.shippingService.updateZone(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete shipping zone' })
  @Permissions('shipping.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.shippingService.removeZone(id));
  }
}

@ApiTags('Shipping Methods')
@Controller('shipping/methods')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ShippingMethodsController extends BaseController {
  constructor(private readonly shippingService: ShippingService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create shipping method' })
  @Permissions('shipping.create')
  create(@Body() dto: CreateShippingMethodDto) {
    return this.handleAsyncOperation(this.shippingService.createMethod(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping methods' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Permissions('shipping.read')
  findAll(@Query('isActive') isActive?: boolean) {
    return this.handleAsyncOperation(
      this.shippingService.findAllMethods(isActive),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipping method' })
  @Permissions('shipping.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShippingMethodDto,
  ) {
    return this.handleAsyncOperation(
      this.shippingService.updateMethod(id, dto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete shipping method' })
  @Permissions('shipping.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.shippingService.removeMethod(id));
  }
}

@ApiTags('Shipping Carriers')
@Controller('shipping/carriers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ShippingCarriersController extends BaseController {
  constructor(private readonly shippingService: ShippingService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create shipping carrier' })
  @Permissions('shipping.create')
  create(@Body() dto: CreateShippingCarrierDto) {
    return this.handleAsyncOperation(this.shippingService.createCarrier(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping carriers' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Permissions('shipping.read')
  findAll(@Query('isActive') isActive?: boolean) {
    return this.handleAsyncOperation(
      this.shippingService.findAllCarriers(isActive),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipping carrier' })
  @Permissions('shipping.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShippingCarrierDto,
  ) {
    return this.handleAsyncOperation(
      this.shippingService.updateCarrier(id, dto),
    );
  }
}

@ApiTags('Shipping Rates')
@Controller('shipping/rates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ShippingRatesController extends BaseController {
  constructor(private readonly shippingService: ShippingService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create shipping rate' })
  @Permissions('shipping.create')
  create(@Body() dto: CreateShippingRateDto) {
    return this.handleAsyncOperation(this.shippingService.createRate(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get shipping rates' })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiQuery({ name: 'methodId', required: false })
  @Permissions('shipping.read')
  findAll(
    @Query('zoneId') zoneId?: string,
    @Query('methodId') methodId?: string,
  ) {
    return this.handleAsyncOperation(
      this.shippingService.findRates(zoneId, methodId),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update shipping rate' })
  @Permissions('shipping.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShippingRateDto,
  ) {
    return this.handleAsyncOperation(this.shippingService.updateRate(id, dto));
  }
}

@ApiTags('Shipping Calculator')
@Controller('shipping/calculate')
export class ShippingCalculatorController extends BaseController {
  constructor(private readonly shippingService: ShippingService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Calculate shipping options' })
  calculate(
    @Body() body: { zoneId: string; weight: number; totalAmount: number },
  ) {
    return this.handleAsyncOperation(
      this.shippingService.calculateShipping(
        body.zoneId,
        body.weight,
        body.totalAmount,
      ),
    );
  }
}

@ApiTags('Delivery Slots')
@Controller('shipping/slots')
export class DeliverySlotsController extends BaseController {
  constructor(private readonly shippingService: ShippingService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create delivery slot' })
  @Permissions('shipping.create')
  create(@Body() dto: CreateDeliverySlotDto) {
    return this.handleAsyncOperation(this.shippingService.createSlot(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get available delivery slots' })
  findAvailable() {
    return this.handleAsyncOperation(this.shippingService.getAvailableSlots());
  }
}
