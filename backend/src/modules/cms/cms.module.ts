import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsService } from './cms.service';
import { PagesController, BannersController } from './cms.controller';
import { Page } from './entities/page.entity';
import { Banner } from './entities/banner.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, Banner]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [PagesController, BannersController],
  providers: [CmsService],
  exports: [CmsService, TypeOrmModule],
})
export class CmsModule {}
