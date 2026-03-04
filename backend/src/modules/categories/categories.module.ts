import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController, BrandsController, AttributesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Attribute } from './entities/attribute.entity';
import { AttributeOption } from './entities/attribute-option.entity';
import { AttributeGroup } from './entities/attribute-group.entity';
import { CategoryAttribute } from './entities/category-attribute.entity';
import { BrandCategory } from './entities/brand-category.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Brand,
      Attribute,
      AttributeOption,
      AttributeGroup,
      CategoryAttribute,
      BrandCategory,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [CategoriesController, BrandsController, AttributesController],
  providers: [CategoriesService],
  exports: [CategoriesService, TypeOrmModule],
})
export class CategoriesModule {}
