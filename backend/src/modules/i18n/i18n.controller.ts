import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { I18nService } from './i18n.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('I18n - Languages')
@Controller('i18n/languages')
export class LanguagesController extends BaseController {
  constructor(private readonly i18nService: I18nService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create language' })
  @Permissions('i18n.create')
  create(@Body() dto: CreateLanguageDto) {
    return this.handleAsyncOperation(this.i18nService.createLanguage(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all languages' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@Query('isActive') isActive?: string) {
    return this.handleAsyncOperation(
      this.i18nService.findAllLanguages({
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      }),
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active languages' })
  findActive() {
    return this.handleAsyncOperation(
      this.i18nService.findAllLanguages({ isActive: true }),
    );
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get language by code' })
  findByCode(@Param('code') code: string) {
    return this.handleAsyncOperation(this.i18nService.findLanguageByCode(code));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get language by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.i18nService.findLanguage(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update language' })
  @Permissions('i18n.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLanguageDto,
  ) {
    return this.handleAsyncOperation(this.i18nService.updateLanguage(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete language' })
  @Permissions('i18n.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.i18nService.deleteLanguage(id));
  }

  @Post(':id/set-default')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set default language' })
  @Permissions('i18n.update')
  setDefault(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.i18nService.setDefaultLanguage(id));
  }
}

@ApiTags('I18n - Currencies')
@Controller('i18n/currencies')
export class CurrenciesController extends BaseController {
  constructor(private readonly i18nService: I18nService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create currency' })
  @Permissions('i18n.create')
  create(@Body() dto: CreateCurrencyDto) {
    return this.handleAsyncOperation(this.i18nService.createCurrency(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@Query('isActive') isActive?: string) {
    return this.handleAsyncOperation(
      this.i18nService.findAllCurrencies({
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      }),
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active currencies' })
  findActive() {
    return this.handleAsyncOperation(
      this.i18nService.findAllCurrencies({ isActive: true }),
    );
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get currency by code' })
  findByCode(@Param('code') code: string) {
    return this.handleAsyncOperation(this.i18nService.findCurrencyByCode(code));
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert amount between currencies' })
  @ApiQuery({ name: 'amount', type: Number })
  @ApiQuery({ name: 'from', type: String })
  @ApiQuery({ name: 'to', type: String })
  convert(
    @Query('amount') amount: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.handleAsyncOperation(
      this.i18nService.convertAmount(Number(amount), from, to),
    );
  }

  @Get(':id/rate-history')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get currency rate history' })
  @Permissions('i18n.read')
  getRateHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.i18nService.getCurrencyRateHistory(
        id,
        limit ? Number(limit) : undefined,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get currency by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.i18nService.findCurrency(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update currency' })
  @Permissions('i18n.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCurrencyDto,
  ) {
    return this.handleAsyncOperation(this.i18nService.updateCurrency(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete currency' })
  @Permissions('i18n.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.i18nService.deleteCurrency(id));
  }

  @Post(':id/set-default')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set default currency' })
  @Permissions('i18n.update')
  setDefault(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.i18nService.setDefaultCurrency(id));
  }
}

@ApiTags('I18n - Translations')
@Controller('i18n/translations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TranslationsController extends BaseController {
  constructor(private readonly i18nService: I18nService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create translation' })
  @Permissions('i18n.create')
  create(@Body() dto: CreateTranslationDto) {
    return this.handleAsyncOperation(this.i18nService.createTranslation(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get translations' })
  @ApiQuery({ name: 'languageId', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @Permissions('i18n.read')
  findAll(
    @Query('languageId') languageId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.handleAsyncOperation(
      this.i18nService.findTranslations({ languageId, entityType, entityId }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update translation' })
  @Permissions('i18n.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTranslationDto,
  ) {
    return this.handleAsyncOperation(
      this.i18nService.updateTranslation(id, dto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete translation' })
  @Permissions('i18n.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.i18nService.deleteTranslation(id));
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Upsert translation' })
  @Permissions('i18n.update')
  upsert(
    @Body()
    dto: {
      languageId: string;
      entityType: string;
      entityId: string;
      field: string;
      value: string;
    },
  ) {
    return this.handleAsyncOperation(
      this.i18nService.upsertTranslation(
        dto.languageId,
        dto.entityType,
        dto.entityId,
        dto.field,
        dto.value,
      ),
    );
  }
}
