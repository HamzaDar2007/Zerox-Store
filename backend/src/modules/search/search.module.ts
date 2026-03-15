import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchQuery } from './entities/search-query.entity';
import { Product } from '../products/entities/product.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchQuery, Product]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService, TypeOrmModule],
})
export class SearchModule {}
