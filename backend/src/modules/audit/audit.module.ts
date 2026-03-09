import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import {
  AuditLogsController,
  ActivityLogsController,
} from './audit.controller';
import { AuditLog } from './entities/audit-log.entity';
import { UserActivityLog } from './entities/user-activity-log.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, UserActivityLog]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [AuditLogsController, ActivityLogsController],
  providers: [AuditService],
  exports: [AuditService, TypeOrmModule],
})
export class AuditModule {}
