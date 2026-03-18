import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { ShippingService } from './shipping.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreateShipmentEventDto } from './dto/create-shipment-event.dto';
import { AddCountryDto } from './dto/add-country.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Shipping')
@Controller('shipping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ShippingController {
  constructor(private readonly svc: ShippingService) {}

  @Post('zones')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a shipping zone (Admin only)' })
  @ApiResponse({ status: 201, description: 'Zone created' })
  createZone(@Body() dto: CreateShippingZoneDto) {
    return this.svc.createZone(dto);
  }

  @Get('zones')
  @Public()
  @ApiOperation({ summary: 'List all shipping zones' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Zones list returned' })
  findAllZones(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAllZones(+(page || 1), +(limit || 50));
  }

  @Get('zones/:id')
  @Public()
  @ApiOperation({ summary: 'Get shipping zone by ID' })
  @ApiParam({ name: 'id', description: 'Zone UUID' })
  @ApiResponse({ status: 200, description: 'Zone found' })
  findZone(@Param('id') id: string) {
    return this.svc.findZone(id);
  }

  @Put('zones/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a shipping zone (Admin only)' })
  @ApiParam({ name: 'id', description: 'Zone UUID' })
  @ApiResponse({ status: 200, description: 'Zone updated' })
  updateZone(@Param('id') id: string, @Body() dto: UpdateShippingZoneDto) {
    return this.svc.updateZone(id, dto);
  }

  @Post('zones/:zoneId/countries')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add country to shipping zone (Admin only)' })
  @ApiParam({ name: 'zoneId', description: 'Zone UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { country: { type: 'string', example: 'PK' } },
      required: ['country'],
    },
  })
  @ApiResponse({ status: 201, description: 'Country added to zone' })
  addCountry(@Param('zoneId') zoneId: string, @Body() dto: AddCountryDto) {
    return this.svc.addCountryToZone(zoneId, dto.country);
  }

  @Get('zones/:zoneId/countries')
  @ApiOperation({ summary: 'Get countries in a shipping zone' })
  @ApiParam({ name: 'zoneId', description: 'Zone UUID' })
  @ApiResponse({ status: 200, description: 'Zone countries returned' })
  getCountries(@Param('zoneId') zoneId: string) {
    return this.svc.getZoneCountries(zoneId);
  }

  @Delete('zones/:zoneId/countries/:country')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove country from shipping zone (Admin only)' })
  @ApiParam({ name: 'zoneId', description: 'Zone UUID' })
  @ApiParam({ name: 'country', description: 'Country code (e.g. US)' })
  @ApiResponse({ status: 200, description: 'Country removed from zone' })
  removeCountry(
    @Param('zoneId') zoneId: string,
    @Param('country') country: string,
  ) {
    return this.svc.removeCountryFromZone(zoneId, country);
  }

  @Post('methods')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a shipping method (Admin only)' })
  @ApiResponse({ status: 201, description: 'Method created' })
  createMethod(@Body() dto: CreateShippingMethodDto) {
    return this.svc.createMethod(dto);
  }

  @Get('methods')
  @ApiOperation({ summary: 'List shipping methods' })
  @ApiQuery({
    name: 'zoneId',
    required: false,
    type: String,
    description: 'Filter by zone UUID',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Methods list returned' })
  findAllMethods(
    @Query('zoneId') zoneId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAllMethods(zoneId, +(page || 1), +(limit || 50));
  }

  @Get('methods/:id')
  @ApiOperation({ summary: 'Get shipping method by ID' })
  @ApiParam({ name: 'id', description: 'Method UUID' })
  @ApiResponse({ status: 200, description: 'Method found' })
  findMethod(@Param('id') id: string) {
    return this.svc.findMethod(id);
  }

  @Put('methods/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a shipping method (Admin only)' })
  @ApiParam({ name: 'id', description: 'Method UUID' })
  @ApiResponse({ status: 200, description: 'Method updated' })
  updateMethod(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    return this.svc.updateMethod(id, dto);
  }

  @Post('shipments')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.SELLER)
  @ApiOperation({ summary: 'Create a shipment (Seller/Admin)' })
  @ApiResponse({ status: 201, description: 'Shipment created' })
  createShipment(@Body() dto: CreateShipmentDto) {
    return this.svc.createShipment(dto);
  }

  @Get('shipments/:id')
  @ApiOperation({ summary: 'Get shipment by ID' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment found' })
  findShipment(@Param('id') id: string) {
    return this.svc.findShipment(id);
  }

  @Put('shipments/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.SELLER)
  @ApiOperation({ summary: 'Update a shipment (Seller/Admin)' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment updated' })
  updateShipment(@Param('id') id: string, @Body() dto: UpdateShipmentDto) {
    return this.svc.updateShipment(id, dto);
  }

  @Post('shipments/:id/events')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.SELLER)
  @ApiOperation({ summary: 'Add tracking event to shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 201, description: 'Event added' })
  addEvent(@Param('id') id: string, @Body() dto: CreateShipmentEventDto) {
    return this.svc.addShipmentEvent({ ...dto, shipmentId: id });
  }

  @Get('shipments/:id/events')
  @ApiOperation({ summary: 'Get tracking events for shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Events returned' })
  getEvents(@Param('id') id: string) {
    return this.svc.getShipmentEvents(id);
  }

  @Get('order/:orderId/shipments')
  @ApiOperation({ summary: 'Get shipments for an order' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order shipments returned' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.svc.findShipmentsByOrder(orderId);
  }
}
