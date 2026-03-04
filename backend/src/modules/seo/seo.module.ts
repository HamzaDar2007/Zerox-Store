import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeoService } from './seo.service';
import { SeoMetadataController, UrlRedirectsController } from './seo.controller';
import { SeoMetadata } from './entities/seo-metadata.entity';
import { UrlRedirect } from './entities/url-redirect.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeoMetadata, UrlRedirect]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [SeoMetadataController, UrlRedirectsController],
  providers: [SeoService],
  exports: [SeoService, TypeOrmModule],
})
export class SeoModule {}
