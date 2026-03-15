import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import {
  UploadProductImageDto,
  UploadProductImagesDto,
} from './dto/upload-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { StorageService } from '../../common/services/storage.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ProductsController {
  constructor(
    private readonly svc: ProductsService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product (Seller/Admin)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @Auditable({ action: 'CREATE', tableName: 'products' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.svc.create(dto, user.id, user.role);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'storeId',
    required: false,
    type: String,
    description: 'Filter by store UUID',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by category UUID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name',
  })
  @ApiResponse({ status: 200, description: 'Products list returned' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('storeId') storeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll({
      page: page ? Math.max(1, +page) : undefined,
      limit: limit ? Math.min(Math.max(1, +limit), 100) : undefined,
      storeId,
      categoryId,
      search,
    });
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find product by slug' })
  @ApiParam({ name: 'slug', description: 'Product URL slug' })
  @ApiResponse({ status: 200, description: 'Product found' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product (Seller/Admin)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @Auditable({ action: 'UPDATE', tableName: 'products' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product (Seller/Admin)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @Auditable({ action: 'DELETE', tableName: 'products' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.remove(id, user.id, user.role);
  }

  @Post('variants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a product variant' })
  @ApiResponse({ status: 201, description: 'Variant created' })
  createVariant(
    @Body() dto: CreateProductVariantDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.createVariant(dto, user.id, user.role);
  }

  @Get(':productId/variants')
  @Public()
  @ApiOperation({ summary: 'List variants for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Variants list returned' })
  findVariants(@Param('productId') productId: string) {
    return this.svc.findVariants(productId);
  }

  @Put('variants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiParam({ name: 'id', description: 'Variant UUID' })
  @ApiResponse({ status: 200, description: 'Variant updated' })
  updateVariant(
    @Param('id') id: string,
    @Body() dto: UpdateProductVariantDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateVariant(id, dto, user.id, user.role);
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product variant' })
  @ApiParam({ name: 'id', description: 'Variant UUID' })
  @ApiResponse({ status: 200, description: 'Variant deleted' })
  removeVariant(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.removeVariant(id, user.id, user.role);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a product image' })
  @ApiResponse({ status: 201, description: 'Image added' })
  createImage(@Body() dto: CreateProductImageDto, @CurrentUser() user: any) {
    return this.svc.createImage(dto, user.id, user.role);
  }

  @Get(':productId/images')
  @Public()
  @ApiOperation({ summary: 'List images for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Images list returned' })
  findImages(@Param('productId') productId: string) {
    return this.svc.findImages(productId);
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product image' })
  @ApiParam({ name: 'id', description: 'Image UUID' })
  @ApiResponse({ status: 200, description: 'Image deleted' })
  removeImage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.removeImage(id, user.id, user.role);
  }

  @Post('images/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload a product image file to R2 and create image record',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        productId: { type: 'string' },
        altText: { type: 'string' },
        sortOrder: { type: 'number' },
        isPrimary: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product image uploaded and saved' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadProductImageDto,
    @CurrentUser() user: any,
  ) {
    const url = await this.storage.upload(file, 'products');
    return this.svc.createImage(
      {
        productId: body.productId,
        url,
        altText: body.altText,
        sortOrder: body.sortOrder ? +body.sortOrder : 0,
        isPrimary: body.isPrimary === 'true',
      },
      user.id,
      user.role,
    );
  }

  @Post('images/upload-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload multiple product images to R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        productId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product images uploaded and saved',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadProductImagesDto,
    @CurrentUser() user: any,
  ) {
    const urls = await this.storage.uploadMany(files, 'products');
    const images = await Promise.all(
      urls.map((url, i) =>
        this.svc.createImage(
          { productId: body.productId, url, sortOrder: i },
          user.id,
          user.role,
        ),
      ),
    );
    return { images };
  }

  // ─── Attribute Keys ────────────────────────────────────────────────────

  @Post('attributes/keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create an attribute key (Admin only)' })
  @ApiResponse({ status: 201, description: 'Attribute key created' })
  createAttributeKey(@Body() dto: any) {
    return this.svc.createAttributeKey(dto);
  }

  @Get('attributes/keys')
  @Public()
  @ApiOperation({ summary: 'List all attribute keys' })
  @ApiResponse({ status: 200, description: 'Attribute keys returned' })
  findAttributeKeys() {
    return this.svc.findAllAttributeKeys();
  }

  @Get('attributes/keys/:id')
  @Public()
  @ApiOperation({ summary: 'Get attribute key by ID' })
  @ApiParam({ name: 'id', description: 'Attribute key UUID' })
  @ApiResponse({ status: 200, description: 'Attribute key found' })
  findAttributeKey(@Param('id') id: string) {
    return this.svc.findAttributeKey(id);
  }

  @Put('attributes/keys/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update attribute key (Admin only)' })
  @ApiParam({ name: 'id', description: 'Attribute key UUID' })
  @ApiResponse({ status: 200, description: 'Attribute key updated' })
  updateAttributeKey(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateAttributeKey(id, dto);
  }

  @Delete('attributes/keys/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete attribute key (Admin only)' })
  @ApiParam({ name: 'id', description: 'Attribute key UUID' })
  @ApiResponse({ status: 200, description: 'Attribute key deleted' })
  removeAttributeKey(@Param('id') id: string) {
    return this.svc.removeAttributeKey(id);
  }

  // ─── Attribute Values ──────────────────────────────────────────────────

  @Post('attributes/keys/:keyId/values')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a value to an attribute key (Admin only)' })
  @ApiParam({ name: 'keyId', description: 'Attribute key UUID' })
  @ApiResponse({ status: 201, description: 'Attribute value created' })
  createAttributeValue(@Param('keyId') keyId: string, @Body() dto: any) {
    return this.svc.createAttributeValue({ ...dto, attributeKeyId: keyId });
  }

  @Get('attributes/keys/:keyId/values')
  @Public()
  @ApiOperation({ summary: 'List values for an attribute key' })
  @ApiParam({ name: 'keyId', description: 'Attribute key UUID' })
  @ApiResponse({ status: 200, description: 'Attribute values returned' })
  findAttributeValues(@Param('keyId') keyId: string) {
    return this.svc.findAttributeValues(keyId);
  }

  @Delete('attributes/values/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an attribute value (Admin only)' })
  @ApiParam({ name: 'id', description: 'Attribute value UUID' })
  @ApiResponse({ status: 200, description: 'Attribute value deleted' })
  removeAttributeValue(@Param('id') id: string) {
    return this.svc.removeAttributeValue(id);
  }

  // ─── Variant Attributes ────────────────────────────────────────────────

  @Post('variants/:variantId/attributes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign attribute to variant' })
  @ApiParam({ name: 'variantId', description: 'Variant UUID' })
  @ApiResponse({ status: 201, description: 'Attribute assigned' })
  assignVariantAttribute(@Param('variantId') variantId: string, @Body() dto: any) {
    return this.svc.assignVariantAttribute({ ...dto, variantId });
  }

  @Get('variants/:variantId/attributes')
  @Public()
  @ApiOperation({ summary: 'List attributes for a variant' })
  @ApiParam({ name: 'variantId', description: 'Variant UUID' })
  @ApiResponse({ status: 200, description: 'Variant attributes returned' })
  findVariantAttributes(@Param('variantId') variantId: string) {
    return this.svc.findVariantAttributes(variantId);
  }

  @Delete('variants/:variantId/attributes/:keyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove attribute from variant' })
  @ApiParam({ name: 'variantId', description: 'Variant UUID' })
  @ApiParam({ name: 'keyId', description: 'Attribute key UUID' })
  @ApiResponse({ status: 200, description: 'Attribute removed from variant' })
  removeVariantAttribute(
    @Param('variantId') variantId: string,
    @Param('keyId') keyId: string,
  ) {
    return this.svc.removeVariantAttribute(variantId, keyId);
  }

  // ─── Product Categories ────────────────────────────────────────────────

  @Post(':productId/categories/:categoryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign product to a category' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiParam({ name: 'categoryId', description: 'Category UUID' })
  @ApiResponse({ status: 201, description: 'Product category assigned' })
  addProductCategory(
    @Param('productId') productId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.svc.addProductCategory(productId, categoryId);
  }

  @Get(':productId/categories')
  @Public()
  @ApiOperation({ summary: 'List categories for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product categories returned' })
  findProductCategories(@Param('productId') productId: string) {
    return this.svc.findProductCategories(productId);
  }

  @Delete(':productId/categories/:categoryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove product from a category' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiParam({ name: 'categoryId', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Product category removed' })
  removeProductCategory(
    @Param('productId') productId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.svc.removeProductCategory(productId, categoryId);
  }
}
