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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';
import {
  CreateTaxZoneDto,
  UpdateTaxZoneDto,
  CreateTaxRateDto,
  UpdateTaxRateDto,
  CreateTaxClassDto,
  UpdateTaxClassDto,
} from './dto';

@ApiTags('Tax Zones')
@Controller('tax/zones')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TaxZonesController extends BaseController {
  constructor(private readonly taxService: TaxService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create tax zone' })
  @Permissions('tax.create')
  create(@Body() dto: CreateTaxZoneDto) {
    return this.handleAsyncOperation(this.taxService.createZone(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all tax zones' })
  @Permissions('tax.read')
  findAll() {
    return this.handleAsyncOperation(this.taxService.findAllZones());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tax zone by ID' })
  @Permissions('tax.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.taxService.findOneZone(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tax zone' })
  @Permissions('tax.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaxZoneDto) {
    return this.handleAsyncOperation(this.taxService.updateZone(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tax zone' })
  @Permissions('tax.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.taxService.removeZone(id));
  }
}

@ApiTags('Tax Rates')
@Controller('tax/rates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TaxRatesController extends BaseController {
  constructor(private readonly taxService: TaxService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create tax rate' })
  @Permissions('tax.create')
  create(@Body() dto: CreateTaxRateDto) {
    return this.handleAsyncOperation(this.taxService.createRate(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all tax rates' })
  @ApiQuery({ name: 'zoneId', required: false })
  @Permissions('tax.read')
  findAll(@Query('zoneId') zoneId?: string) {
    return this.handleAsyncOperation(this.taxService.findAllRates(zoneId));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tax rate' })
  @Permissions('tax.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaxRateDto) {
    return this.handleAsyncOperation(this.taxService.updateRate(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tax rate' })
  @Permissions('tax.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.taxService.removeRate(id));
  }
}

@ApiTags('Tax Classes')
@Controller('tax/classes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TaxClassesController extends BaseController {
  constructor(private readonly taxService: TaxService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create tax class' })
  @Permissions('tax.create')
  create(@Body() dto: CreateTaxClassDto) {
    return this.handleAsyncOperation(this.taxService.createClass(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all tax classes' })
  @Permissions('tax.read')
  findAll() {
    return this.handleAsyncOperation(this.taxService.findAllClasses());
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tax class' })
  @Permissions('tax.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaxClassDto) {
    return this.handleAsyncOperation(this.taxService.updateClass(id, dto));
  }
}

@ApiTags('Tax Calculator')
@Controller('tax/calculate')
export class TaxCalculatorController extends BaseController {
  constructor(private readonly taxService: TaxService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Calculate tax' })
  calculate(
    @Body() body: { amount: number; countryCode: string; stateCode?: string; taxClassId?: string },
  ) {
    return this.handleAsyncOperation(
      this.taxService.calculateTax(body.amount, body.countryCode, body.stateCode, body.taxClassId),
    );
  }
}
