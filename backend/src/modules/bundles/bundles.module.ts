import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BundlesService } from './bundles.service';
import { BundlesController } from './bundles.controller';
import { ProductBundle } from './entities/product-bundle.entity';
import { BundleItem } from './entities/bundle-item.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductBundle, BundleItem]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [BundlesController],
  providers: [BundlesService],
  exports: [BundlesService, TypeOrmModule],
})
export class BundlesModule {}
