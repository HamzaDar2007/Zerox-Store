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
import { SeoService } from './seo.service';
import { CreateSeoMetadataDto } from './dto/create-seo-metadata.dto';
import { UpdateSeoMetadataDto } from './dto/update-seo-metadata.dto';
import { CreateUrlRedirectDto } from './dto/create-url-redirect.dto';
import { UpdateUrlRedirectDto } from './dto/update-url-redirect.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('SEO - Metadata')
@Controller('seo/metadata')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class SeoMetadataController extends BaseController {
  constructor(private readonly seoService: SeoService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create SEO metadata' })
  @Permissions('seo.create')
  create(@Body() dto: CreateSeoMetadataDto) {
    return this.handleAsyncOperation(this.seoService.createMetadata(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all SEO metadata' })
  @ApiQuery({ name: 'entityType', required: false })
  @Permissions('seo.read')
  findAll(
    @Query('entityType') entityType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.seoService.findAllMetadata({ entityType, page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SEO metadata by ID' })
  @Permissions('seo.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.seoService.findMetadata(id));
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get SEO metadata by entity' })
  @Permissions('seo.read')
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.handleAsyncOperation(
      this.seoService.findMetadataByEntity(entityType, entityId),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SEO metadata' })
  @Permissions('seo.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeoMetadataDto,
  ) {
    return this.handleAsyncOperation(this.seoService.updateMetadata(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SEO metadata' })
  @Permissions('seo.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.seoService.deleteMetadata(id));
  }

  @Post('upsert/:entityType/:entityId')
  @ApiOperation({ summary: 'Upsert SEO metadata for entity' })
  @Permissions('seo.update')
  upsert(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() dto: UpdateSeoMetadataDto,
  ) {
    return this.handleAsyncOperation(
      this.seoService.upsertMetadata(entityType, entityId, dto),
    );
  }
}

@ApiTags('SEO - Redirects')
@Controller('seo/redirects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class UrlRedirectsController extends BaseController {
  constructor(private readonly seoService: SeoService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create URL redirect' })
  @Permissions('seo.create')
  create(@Body() dto: CreateUrlRedirectDto) {
    return this.handleAsyncOperation(this.seoService.createRedirect(dto));
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create URL redirects' })
  @Permissions('seo.create')
  bulkCreate(@Body() redirects: CreateUrlRedirectDto[]) {
    return this.handleAsyncOperation(
      this.seoService.bulkCreateRedirects(redirects),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all URL redirects' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Permissions('seo.read')
  findAll(
    @Query('isActive') isActive?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.seoService.findAllRedirects({
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page,
        limit,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get URL redirect by ID' })
  @Permissions('seo.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.seoService.findRedirect(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update URL redirect' })
  @Permissions('seo.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUrlRedirectDto,
  ) {
    return this.handleAsyncOperation(this.seoService.updateRedirect(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete URL redirect' })
  @Permissions('seo.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.seoService.deleteRedirect(id));
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle URL redirect active status' })
  @Permissions('seo.update')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.seoService.toggleRedirectActive(id));
  }
}
