import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { FeatureFlag } from './entities/feature-flag.entity';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemSetting)
    private settingRepository: Repository<SystemSetting>,
    @InjectRepository(FeatureFlag)
    private featureFlagRepository: Repository<FeatureFlag>,
    private dataSource: DataSource,
  ) {}

  async createSetting(
    dto: CreateSystemSettingDto,
  ): Promise<ServiceResponse<SystemSetting>> {
    const setting = new SystemSetting();
    Object.assign(setting, dto);
    const saved = await this.settingRepository.save(setting);
    return { success: true, message: 'Setting created', data: saved };
  }

  async findAllSettings(options?: {
    group?: string;
    isPublic?: boolean;
  }): Promise<ServiceResponse<SystemSetting[]>> {
    const where: any = {};
    if (options?.group) where.group = options.group;
    if (options?.isPublic !== undefined) where.isPublic = options.isPublic;
    const settings = await this.settingRepository.find({
      where,
      order: { group: 'ASC', key: 'ASC' },
    });
    return { success: true, message: 'Settings retrieved', data: settings };
  }

  async findSetting(id: string): Promise<ServiceResponse<SystemSetting>> {
    const setting = await this.settingRepository.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('Setting not found');
    return { success: true, message: 'Setting retrieved', data: setting };
  }

  async findSettingByKey(key: string): Promise<ServiceResponse<SystemSetting>> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return { success: true, message: 'Setting retrieved', data: setting };
  }

  async getSettingValue(
    key: string,
    defaultValue?: string,
  ): Promise<string | null> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    return setting?.value ?? defaultValue ?? null;
  }

  async updateSetting(
    id: string,
    dto: UpdateSystemSettingDto,
  ): Promise<ServiceResponse<SystemSetting>> {
    const setting = await this.settingRepository.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('Setting not found');
    Object.assign(setting, dto);
    const updated = await this.settingRepository.save(setting);
    return { success: true, message: 'Setting updated', data: updated };
  }

  async updateSettingByKey(
    key: string,
    value: string,
  ): Promise<ServiceResponse<SystemSetting>> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    setting.value = value;
    const updated = await this.settingRepository.save(setting);
    return { success: true, message: 'Setting updated', data: updated };
  }

  async deleteSetting(id: string): Promise<ServiceResponse<void>> {
    const result = await this.settingRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Setting not found');
    return { success: true, message: 'Setting deleted', data: undefined };
  }

  async getSettingsByGroup(
    group: string,
  ): Promise<ServiceResponse<Record<string, string>>> {
    const settings = await this.settingRepository.find({ where: { group } });
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      if (s.value) result[s.key] = s.value;
    });
    return { success: true, message: 'Settings retrieved', data: result };
  }

  async bulkUpdateSettings(
    settings: { key: string; value: string }[],
  ): Promise<ServiceResponse<SystemSetting[]>> {
    const updated: SystemSetting[] = [];
    for (const { key, value } of settings) {
      const setting = await this.settingRepository.findOne({ where: { key } });
      if (setting) {
        setting.value = value;
        updated.push(await this.settingRepository.save(setting));
      }
    }
    return {
      success: true,
      message: `${updated.length} settings updated`,
      data: updated,
    };
  }

  async createFeatureFlag(
    dto: CreateFeatureFlagDto,
  ): Promise<ServiceResponse<FeatureFlag>> {
    const flag = new FeatureFlag();
    Object.assign(flag, dto);
    const saved = await this.featureFlagRepository.save(flag);
    return { success: true, message: 'Feature flag created', data: saved };
  }

  async findAllFeatureFlags(): Promise<ServiceResponse<FeatureFlag[]>> {
    const flags = await this.featureFlagRepository.find({
      order: { name: 'ASC' },
    });
    return { success: true, message: 'Feature flags retrieved', data: flags };
  }

  async findFeatureFlag(id: string): Promise<ServiceResponse<FeatureFlag>> {
    const flag = await this.featureFlagRepository.findOne({ where: { id } });
    if (!flag) throw new NotFoundException('Feature flag not found');
    return { success: true, message: 'Feature flag retrieved', data: flag };
  }

  async isFeatureEnabled(name: string): Promise<boolean> {
    const flag = await this.featureFlagRepository.findOne({ where: { name } });
    return flag?.isEnabled ?? false;
  }

  async updateFeatureFlag(
    id: string,
    dto: UpdateFeatureFlagDto,
  ): Promise<ServiceResponse<FeatureFlag>> {
    const flag = await this.featureFlagRepository.findOne({ where: { id } });
    if (!flag) throw new NotFoundException('Feature flag not found');
    Object.assign(flag, dto);
    const updated = await this.featureFlagRepository.save(flag);
    return { success: true, message: 'Feature flag updated', data: updated };
  }

  async toggleFeatureFlag(id: string): Promise<ServiceResponse<FeatureFlag>> {
    const flag = await this.featureFlagRepository.findOne({ where: { id } });
    if (!flag) throw new NotFoundException('Feature flag not found');
    flag.isEnabled = !flag.isEnabled;
    const updated = await this.featureFlagRepository.save(flag);
    return {
      success: true,
      message: `Feature ${flag.isEnabled ? 'enabled' : 'disabled'}`,
      data: updated,
    };
  }

  async deleteFeatureFlag(id: string): Promise<ServiceResponse<void>> {
    const result = await this.featureFlagRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Feature flag not found');
    return { success: true, message: 'Feature flag deleted', data: undefined };
  }

  async getEnabledFeatures(): Promise<ServiceResponse<string[]>> {
    const flags = await this.featureFlagRepository.find({
      where: { isEnabled: true },
    });
    return {
      success: true,
      message: 'Enabled features retrieved',
      data: flags.map((f) => f.name),
    };
  }

  async getHealthCheck(): Promise<ServiceResponse<Record<string, any>>> {
    const checks: Record<string, any> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: {},
    };

    // Check database connectivity
    try {
      await this.dataSource.query('SELECT 1');
      checks.services.database = { status: 'up' };
    } catch {
      checks.services.database = { status: 'down' };
      checks.status = 'degraded';
    }

    return { success: true, message: 'Health check completed', data: checks };
  }
}
