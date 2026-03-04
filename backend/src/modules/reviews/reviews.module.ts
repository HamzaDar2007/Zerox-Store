import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { ReviewHelpfulness } from './entities/review-helpfulness.entity';
import { ReviewReport } from './entities/review-report.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ReviewHelpfulness,
      ReviewReport,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService, TypeOrmModule],
})
export class ReviewsModule {}
