import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationsService } from './operations.service';
import {
  BulkOperationsController,
  ImportExportController,
} from './operations.controller';
import { BulkOperation } from './entities/bulk-operation.entity';
import { ImportExportJob } from './entities/import-export-job.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BulkOperation, ImportExportJob]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [BulkOperationsController, ImportExportController],
  providers: [OperationsService],
  exports: [OperationsService, TypeOrmModule],
})
export class OperationsModule {}
