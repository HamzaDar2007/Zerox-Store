import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from './i18n.service';
import { LanguagesController, CurrenciesController, TranslationsController } from './i18n.controller';
import { Language } from './entities/language.entity';
import { Currency } from './entities/currency.entity';
import { Translation } from './entities/translation.entity';
import { CurrencyRateHistory } from './entities/currency-rate-history.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language, Currency, Translation, CurrencyRateHistory]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [LanguagesController, CurrenciesController, TranslationsController],
  providers: [I18nService],
  exports: [I18nService, TypeOrmModule],
})
export class I18nModule {}
