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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('CMS - Pages')
@Controller('cms/pages')
export class PagesController extends BaseController {
  constructor(private readonly cmsService: CmsService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create page' })
  @Permissions('cms.create')
  create(@Body() dto: CreatePageDto) {
    return this.handleAsyncOperation(this.cmsService.createPage(dto));
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all pages' })
  @Permissions('cms.read')
  findAll(
    @Query('isPublished') isPublished?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.cmsService.findAllPages({
        isPublished:
          isPublished === 'true'
            ? true
            : isPublished === 'false'
              ? false
              : undefined,
        page,
        limit,
      }),
    );
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published pages' })
  findPublished(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.handleAsyncOperation(
      this.cmsService.findAllPages({ isPublished: true, page, limit }),
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.handleAsyncOperation(this.cmsService.findPageBySlug(slug));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get page by ID' })
  @Permissions('cms.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cmsService.findPage(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update page' })
  @Permissions('cms.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePageDto) {
    return this.handleAsyncOperation(this.cmsService.updatePage(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete page' })
  @Permissions('cms.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cmsService.deletePage(id));
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish page' })
  @Permissions('cms.update')
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cmsService.publishPage(id));
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unpublish page' })
  @Permissions('cms.update')
  unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cmsService.unpublishPage(id));
  }
}

@ApiTags('CMS - Banners')
@Controller('cms/banners')
export class BannersController extends BaseController {
  constructor(private readonly cmsService: CmsService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create banner' })
  @Permissions('cms.create')
  create(@Body() dto: CreateBannerDto) {
    return this.handleAsyncOperation(this.cmsService.createBanner(dto));
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all banners' })
  @Permissions('cms.read')
  findAll(
    @Query('isActive') isActive?: string,
    @Query('position') position?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.cmsService.findAllBanners({
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        position,
        page,
        limit,
      }),
    );
  }

  @Get('active/:position')
  @ApiOperation({ summary: 'Get active banners by position' })
  findActiveByPosition(@Param('position') position: string) {
    return this.handleAsyncOperation(
      this.cmsService.getActiveBannersByPosition(position),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get banner by ID' })
  @Permissions('cms.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cmsService.findBanner(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update banner' })
  @Permissions('cms.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBannerDto) {
    return this.handleAsyncOperation(this.cmsService.updateBanner(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete banner' })
  @Permissions('cms.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cmsService.deleteBanner(id));
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle banner active status' })
  @Permissions('cms.update')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cmsService.toggleBannerActive(id));
  }
}
