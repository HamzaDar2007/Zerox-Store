import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchHistory } from './entities/search-history.entity';
import { RecentlyViewed } from './entities/recently-viewed.entity';
import { ProductComparison } from './entities/product-comparison.entity';
import { ProductRecommendation } from './entities/product-recommendation.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SearchHistory,
      RecentlyViewed,
      ProductComparison,
      ProductRecommendation,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService, TypeOrmModule],
})
export class SearchModule {}
