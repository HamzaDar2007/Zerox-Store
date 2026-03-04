import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('System - Settings')
@Controller('system/settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class SettingsController extends BaseController {
  constructor(private readonly systemService: SystemService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create setting' })
  @Permissions('system.create')
  create(@Body() dto: CreateSystemSettingDto) {
    return this.handleAsyncOperation(this.systemService.createSetting(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiQuery({ name: 'group', required: false })
  @Permissions('system.read')
  findAll(@Query('group') group?: string) {
    return this.handleAsyncOperation(this.systemService.findAllSettings({ group }));
  }

  @Get('group/:group')
  @ApiOperation({ summary: 'Get settings by group' })
  @Permissions('system.read')
  findByGroup(@Param('group') group: string) {
    return this.handleAsyncOperation(this.systemService.getSettingsByGroup(group));
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  @Permissions('system.read')
  findByKey(@Param('key') key: string) {
    return this.handleAsyncOperation(this.systemService.findSettingByKey(key));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get setting by ID' })
  @Permissions('system.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.systemService.findSetting(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update setting' })
  @Permissions('system.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSystemSettingDto) {
    return this.handleAsyncOperation(this.systemService.updateSetting(id, dto));
  }

  @Patch('key/:key')
  @ApiOperation({ summary: 'Update setting by key' })
  @Permissions('system.update')
  updateByKey(@Param('key') key: string, @Body('value') value: string) {
    return this.handleAsyncOperation(this.systemService.updateSettingByKey(key, value));
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update settings' })
  @Permissions('system.update')
  bulkUpdate(@Body() settings: { key: string; value: string }[]) {
    return this.handleAsyncOperation(this.systemService.bulkUpdateSettings(settings));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete setting' })
  @Permissions('system.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.systemService.deleteSetting(id));
  }
}

@ApiTags('System - Feature Flags')
@Controller('system/features')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class FeatureFlagsController extends BaseController {
  constructor(private readonly systemService: SystemService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create feature flag' })
  @Permissions('system.create')
  create(@Body() dto: CreateFeatureFlagDto) {
    return this.handleAsyncOperation(this.systemService.createFeatureFlag(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all feature flags' })
  @Permissions('system.read')
  findAll() {
    return this.handleAsyncOperation(this.systemService.findAllFeatureFlags());
  }

  @Get('enabled')
  @ApiOperation({ summary: 'Get enabled features' })
  @Permissions('system.read')
  getEnabled() {
    return this.handleAsyncOperation(this.systemService.getEnabledFeatures());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature flag by ID' })
  @Permissions('system.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.systemService.findFeatureFlag(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feature flag' })
  @Permissions('system.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFeatureFlagDto) {
    return this.handleAsyncOperation(this.systemService.updateFeatureFlag(id, dto));
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle feature flag' })
  @Permissions('system.update')
  toggle(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.systemService.toggleFeatureFlag(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feature flag' })
  @Permissions('system.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.systemService.deleteFeatureFlag(id));
  }
}
