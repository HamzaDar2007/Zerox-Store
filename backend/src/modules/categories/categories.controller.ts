import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController extends BaseController {
  constructor(private readonly categoriesService: CategoriesService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @Permissions('categories.create')
  create(@Body() dto: CreateCategoryDto) {
    return this.handleAsyncOperation(
      this.categoriesService.createCategory(dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  findAll() {
    return this.handleAsyncOperation(
      this.categoriesService.findAllCategories(),
    );
  }

  @Get('root')
  @ApiOperation({ summary: 'Get root categories' })
  @ApiResponse({
    status: 200,
    description: 'Root categories retrieved successfully',
  })
  findRoots() {
    return this.handleAsyncOperation(
      this.categoriesService.findRootCategories(),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.categoriesService.findOneCategory(id),
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  findBySlug(@Param('slug') slug: string) {
    return this.handleAsyncOperation(
      this.categoriesService.findCategoryBySlug(slug),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @Permissions('categories.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.handleAsyncOperation(
      this.categoriesService.updateCategory(id, dto),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @Permissions('categories.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.categoriesService.removeCategory(id));
  }

  @Post(':categoryId/brands/:brandId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign brand to category' })
  @Permissions('categories.update')
  assignBrand(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Param('brandId', ParseUUIDPipe) brandId: string,
  ) {
    return this.handleAsyncOperation(
      this.categoriesService.assignBrandToCategory(categoryId, brandId),
    );
  }

  @Delete(':categoryId/brands/:brandId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove brand from category' })
  @Permissions('categories.update')
  removeBrand(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Param('brandId', ParseUUIDPipe) brandId: string,
  ) {
    return this.handleAsyncOperation(
      this.categoriesService.removeBrandFromCategory(categoryId, brandId),
    );
  }
}

@ApiTags('Brands')
@Controller('brands')
export class BrandsController extends BaseController {
  constructor(private readonly categoriesService: CategoriesService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create brand' })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  @Permissions('brands.create')
  create(@Body() dto: CreateBrandDto) {
    return this.handleAsyncOperation(this.categoriesService.createBrand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({ status: 200, description: 'Brands retrieved successfully' })
  findAll() {
    return this.handleAsyncOperation(this.categoriesService.findAllBrands());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.categoriesService.findOneBrand(id));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully' })
  findBySlug(@Param('slug') slug: string) {
    return this.handleAsyncOperation(
      this.categoriesService.findBrandBySlug(slug),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update brand' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
  @Permissions('brands.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto) {
    return this.handleAsyncOperation(
      this.categoriesService.updateBrand(id, dto),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  @Permissions('brands.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.categoriesService.removeBrand(id));
  }
}

@ApiTags('Attributes')
@Controller('attributes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class AttributesController extends BaseController {
  constructor(private readonly categoriesService: CategoriesService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create attribute' })
  @ApiResponse({ status: 201, description: 'Attribute created successfully' })
  @Permissions('attributes.create')
  create(@Body() dto: CreateAttributeDto) {
    return this.handleAsyncOperation(
      this.categoriesService.createAttribute(dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all attributes' })
  @ApiResponse({
    status: 200,
    description: 'Attributes retrieved successfully',
  })
  findAll() {
    return this.handleAsyncOperation(
      this.categoriesService.findAllAttributes(),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attribute by ID' })
  @ApiResponse({ status: 200, description: 'Attribute retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.categoriesService.findOneAttribute(id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attribute' })
  @ApiResponse({ status: 200, description: 'Attribute updated successfully' })
  @Permissions('attributes.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttributeDto,
  ) {
    return this.handleAsyncOperation(
      this.categoriesService.updateAttribute(id, dto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attribute' })
  @ApiResponse({ status: 200, description: 'Attribute deleted successfully' })
  @Permissions('attributes.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(
      this.categoriesService.removeAttribute(id),
    );
  }
}
