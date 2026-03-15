import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { StorageService } from '../../common/services/storage.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CategoriesController {
  constructor(
    private readonly svc: CategoriesService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @Auditable({ action: 'CREATE', tableName: 'categories' })
  create(@Body() dto: CreateCategoryDto) {
    return this.svc.createCategory(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all categories' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Categories list returned' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAllCategories(+(page || 1), +(limit || 50));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  findOne(@Param('id') id: string) {
    return this.svc.findCategory(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @Auditable({ action: 'UPDATE', tableName: 'categories' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.svc.updateCategory(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @Auditable({ action: 'DELETE', tableName: 'categories' })
  remove(@Param('id') id: string) {
    return this.svc.removeCategory(id);
  }

  @Patch(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload category image to R2 (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Category image updated' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.storage.upload(file, 'categories');
    return this.svc.updateCategory(id, { imageUrl } as any);
  }
}

@ApiTags('Brands')
@Controller('brands')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class BrandsController {
  constructor(
    private readonly svc: CategoriesService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a brand (Admin only)' })
  @ApiResponse({ status: 201, description: 'Brand created' })
  @Auditable({ action: 'CREATE', tableName: 'brands' })
  create(@Body() dto: CreateBrandDto) {
    return this.svc.createBrand(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all brands' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Brands list returned' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAllBrands(+(page || 1), +(limit || 50));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiParam({ name: 'id', description: 'Brand UUID' })
  @ApiResponse({ status: 200, description: 'Brand found' })
  findOne(@Param('id') id: string) {
    return this.svc.findBrand(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a brand (Admin only)' })
  @ApiParam({ name: 'id', description: 'Brand UUID' })
  @ApiResponse({ status: 200, description: 'Brand updated' })
  @Auditable({ action: 'UPDATE', tableName: 'brands' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.svc.updateBrand(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a brand (Admin only)' })
  @ApiParam({ name: 'id', description: 'Brand UUID' })
  @ApiResponse({ status: 200, description: 'Brand deleted' })
  @Auditable({ action: 'DELETE', tableName: 'brands' })
  remove(@Param('id') id: string) {
    return this.svc.removeBrand(id);
  }

  @Patch(':id/logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload brand logo to R2 (Admin only)' })
  @ApiParam({ name: 'id', description: 'Brand UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Brand logo updated' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const logoUrl = await this.storage.upload(file, 'brands');
    return this.svc.updateBrand(id, { logoUrl } as any);
  }
}
