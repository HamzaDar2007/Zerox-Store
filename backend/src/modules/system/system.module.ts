import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemService } from './system.service';
import {
  SettingsController,
  FeatureFlagsController,
  HealthController,
} from './system.controller';
import { SystemSetting } from './entities/system-setting.entity';
import { FeatureFlag } from './entities/feature-flag.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting, FeatureFlag]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [SettingsController, FeatureFlagsController, HealthController],
  providers: [SystemService],
  exports: [SystemService, TypeOrmModule],
})
export class SystemModule {}
