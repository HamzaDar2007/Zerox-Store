import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './entities/language.entity';
import { Currency } from './entities/currency.entity';
import { Translation } from './entities/translation.entity';
import { CurrencyRateHistory } from './entities/currency-rate-history.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class I18nService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
    @InjectRepository(CurrencyRateHistory)
    private rateHistoryRepository: Repository<CurrencyRateHistory>,
  ) {}

  async createLanguage(dto: CreateLanguageDto): Promise<ServiceResponse<Language>> {
    const language = new Language();
    Object.assign(language, dto);
    const saved = await this.languageRepository.save(language);
    return { success: true, message: 'Language created', data: saved };
  }

  async findAllLanguages(options?: { isActive?: boolean }): Promise<ServiceResponse<Language[]>> {
    const where: any = {};
    if (options?.isActive !== undefined) where.isActive = options.isActive;
    const languages = await this.languageRepository.find({ where, order: { sortOrder: 'ASC', name: 'ASC' } });
    return { success: true, message: 'Languages retrieved', data: languages };
  }

  async findLanguage(id: string): Promise<ServiceResponse<Language>> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) throw new NotFoundException('Language not found');
    return { success: true, message: 'Language retrieved', data: language };
  }

  async findLanguageByCode(code: string): Promise<ServiceResponse<Language>> {
    const language = await this.languageRepository.findOne({ where: { code } });
    if (!language) throw new NotFoundException('Language not found');
    return { success: true, message: 'Language retrieved', data: language };
  }

  async updateLanguage(id: string, dto: UpdateLanguageDto): Promise<ServiceResponse<Language>> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) throw new NotFoundException('Language not found');
    Object.assign(language, dto);
    const updated = await this.languageRepository.save(language);
    return { success: true, message: 'Language updated', data: updated };
  }

  async deleteLanguage(id: string): Promise<ServiceResponse<void>> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (language?.isDefault) throw new BadRequestException('Cannot delete default language');
    const result = await this.languageRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Language not found');
    return { success: true, message: 'Language deleted', data: undefined };
  }

  async setDefaultLanguage(id: string): Promise<ServiceResponse<Language>> {
    await this.languageRepository.update({}, { isDefault: false });
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) throw new NotFoundException('Language not found');
    language.isDefault = true;
    language.isActive = true;
    const updated = await this.languageRepository.save(language);
    return { success: true, message: 'Default language set', data: updated };
  }

  async createCurrency(dto: CreateCurrencyDto): Promise<ServiceResponse<Currency>> {
    const currency = new Currency();
    Object.assign(currency, dto);
    const saved = await this.currencyRepository.save(currency);
    return { success: true, message: 'Currency created', data: saved };
  }

  async findAllCurrencies(options?: { isActive?: boolean }): Promise<ServiceResponse<Currency[]>> {
    const where: any = {};
    if (options?.isActive !== undefined) where.isActive = options.isActive;
    const currencies = await this.currencyRepository.find({ where, order: { code: 'ASC' } });
    return { success: true, message: 'Currencies retrieved', data: currencies };
  }

  async findCurrency(id: string): Promise<ServiceResponse<Currency>> {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) throw new NotFoundException('Currency not found');
    return { success: true, message: 'Currency retrieved', data: currency };
  }

  async findCurrencyByCode(code: string): Promise<ServiceResponse<Currency>> {
    const currency = await this.currencyRepository.findOne({ where: { code } });
    if (!currency) throw new NotFoundException('Currency not found');
    return { success: true, message: 'Currency retrieved', data: currency };
  }

  async updateCurrency(id: string, dto: UpdateCurrencyDto): Promise<ServiceResponse<Currency>> {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) throw new NotFoundException('Currency not found');
    if (dto.exchangeRate && dto.exchangeRate !== currency.exchangeRate) {
      const history = new CurrencyRateHistory();
      history.currencyId = id;
      history.rate = dto.exchangeRate;
      await this.rateHistoryRepository.save(history);
    }
    Object.assign(currency, dto);
    const updated = await this.currencyRepository.save(currency);
    return { success: true, message: 'Currency updated', data: updated };
  }

  async deleteCurrency(id: string): Promise<ServiceResponse<void>> {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (currency?.isDefault) throw new BadRequestException('Cannot delete default currency');
    const result = await this.currencyRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Currency not found');
    return { success: true, message: 'Currency deleted', data: undefined };
  }

  async setDefaultCurrency(id: string): Promise<ServiceResponse<Currency>> {
    await this.currencyRepository.update({}, { isDefault: false });
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) throw new NotFoundException('Currency not found');
    currency.isDefault = true;
    currency.isActive = true;
    const updated = await this.currencyRepository.save(currency);
    return { success: true, message: 'Default currency set', data: updated };
  }

  async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<ServiceResponse<{ amount: number; rate: number }>> {
    const from = await this.currencyRepository.findOne({ where: { code: fromCurrency } });
    const to = await this.currencyRepository.findOne({ where: { code: toCurrency } });
    if (!from || !to) throw new NotFoundException('Currency not found');
    const rate = Number(to.exchangeRate) / Number(from.exchangeRate);
    return { success: true, message: 'Amount converted', data: { amount: amount * rate, rate } };
  }

  async getCurrencyRateHistory(currencyId: string, limit = 30): Promise<ServiceResponse<CurrencyRateHistory[]>> {
    const history = await this.rateHistoryRepository.find({
      where: { currencyId },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
    return { success: true, message: 'Rate history retrieved', data: history };
  }

  async createTranslation(dto: CreateTranslationDto): Promise<ServiceResponse<Translation>> {
    const translation = new Translation();
    Object.assign(translation, dto);
    const saved = await this.translationRepository.save(translation);
    return { success: true, message: 'Translation created', data: saved };
  }

  async findTranslations(options?: { languageId?: string; entityType?: string; entityId?: string }): Promise<ServiceResponse<Translation[]>> {
    const where: any = {};
    if (options?.languageId) where.languageId = options.languageId;
    if (options?.entityType) where.entityType = options.entityType;
    if (options?.entityId) where.entityId = options.entityId;
    const translations = await this.translationRepository.find({ where, relations: ['language'] });
    return { success: true, message: 'Translations retrieved', data: translations };
  }

  async updateTranslation(id: string, dto: UpdateTranslationDto): Promise<ServiceResponse<Translation>> {
    const translation = await this.translationRepository.findOne({ where: { id } });
    if (!translation) throw new NotFoundException('Translation not found');
    Object.assign(translation, dto);
    const updated = await this.translationRepository.save(translation);
    return { success: true, message: 'Translation updated', data: updated };
  }

  async deleteTranslation(id: string): Promise<ServiceResponse<void>> {
    const result = await this.translationRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Translation not found');
    return { success: true, message: 'Translation deleted', data: undefined };
  }

  async upsertTranslation(languageId: string, entityType: string, entityId: string, fieldName: string, translatedValue: string): Promise<ServiceResponse<Translation>> {
    let translation = await this.translationRepository.findOne({ where: { languageId, entityType, entityId, fieldName } });
    if (translation) {
      translation.translatedValue = translatedValue;
    } else {
      translation = new Translation();
      translation.languageId = languageId;
      translation.entityType = entityType;
      translation.entityId = entityId;
      translation.fieldName = fieldName;
      translation.translatedValue = translatedValue;
    }
    const saved = await this.translationRepository.save(translation);
    return { success: true, message: 'Translation saved', data: saved };
  }
}
