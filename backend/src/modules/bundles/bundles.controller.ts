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
import { BundlesService } from './bundles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';
import { CreateProductBundleDto } from './dto/create-product-bundle.dto';
import { UpdateProductBundleDto } from './dto/update-product-bundle.dto';

@ApiTags('Bundles')
@Controller('bundles')
export class BundlesController extends BaseController {
  constructor(private readonly bundlesService: BundlesService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create bundle' })
  @Permissions('bundles.create')
  create(@Body() dto: CreateProductBundleDto) {
    return this.handleAsyncOperation(this.bundlesService.create(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all bundles' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.bundlesService.findAll({
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page,
        limit,
      }),
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active bundles' })
  findActive(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.handleAsyncOperation(
      this.bundlesService.findAll({ isActive: true, page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bundle by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.bundlesService.findOne(id));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get bundle by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.handleAsyncOperation(this.bundlesService.findBySlug(slug));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update bundle' })
  @Permissions('bundles.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductBundleDto,
  ) {
    return this.handleAsyncOperation(this.bundlesService.update(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete bundle' })
  @Permissions('bundles.delete')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.bundlesService.delete(id));
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle bundle active status' })
  @Permissions('bundles.update')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.bundlesService.toggleActive(id));
  }

  @Post(':id/items')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add item to bundle' })
  @Permissions('bundles.update')
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { productId: string; variantId?: string; quantity?: number },
  ) {
    return this.handleAsyncOperation(this.bundlesService.addItem(id, dto));
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get bundle items' })
  getItems(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.bundlesService.getItems(id));
  }

  @Patch(':id/items/:itemId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update bundle item' })
  @Permissions('bundles.update')
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body()
    dto: Partial<{
      productId: string;
      variantId: string;
      quantity: number;
      sortOrder: number;
    }>,
  ) {
    return this.handleAsyncOperation(
      this.bundlesService.updateItem(id, itemId, dto),
    );
  }

  @Delete(':id/items/:itemId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove item from bundle' })
  @Permissions('bundles.update')
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.handleAsyncOperation(
      this.bundlesService.removeItem(id, itemId),
    );
  }

  @Get(':id/price')
  @ApiOperation({ summary: 'Calculate bundle price' })
  calculatePrice(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.bundlesService.calculateBundlePrice(id),
    );
  }
}
