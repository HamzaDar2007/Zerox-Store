import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import {
  CategoriesController,
  BrandsController,
} from './categories.controller';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Brand]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [CategoriesController, BrandsController],
  providers: [CategoriesService],
  exports: [CategoriesService, TypeOrmModule],
})
export class CategoriesModule {}
