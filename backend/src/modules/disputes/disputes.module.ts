import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { Dispute } from './entities/dispute.entity';
import { DisputeEvidence } from './entities/dispute-evidence.entity';
import { DisputeMessage } from './entities/dispute-message.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute, DisputeEvidence, DisputeMessage]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService, TypeOrmModule],
})
export class DisputesModule {}
