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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { ProductStatus } from '@common/enums';

@ApiTags('Products')
@Controller('products')
export class ProductsController extends BaseController {
  constructor(private readonly productsService: ProductsService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @Permissions('products.create')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.productsService.create(dto, user.id));
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: ProductStatus,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.productsService.findAll({
        categoryId,
        brandId,
        sellerId,
        status,
        search,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.productsService.findOne(id));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  findBySlug(@Param('slug') slug: string) {
    return this.handleAsyncOperation(this.productsService.findBySlug(slug));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @Permissions('products.update')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.handleAsyncOperation(this.productsService.update(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @Permissions('products.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.productsService.remove(id));
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product status' })
  @Permissions('products.update')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ProductStatus,
  ) {
    return this.handleAsyncOperation(
      this.productsService.updateStatus(id, status),
    );
  }

  // ==================== VARIANTS ====================

  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create product variant' })
  @Permissions('products.update')
  createVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.handleAsyncOperation(
      this.productsService.createVariant(productId, dto),
    );
  }

  @Get(':productId/variants')
  @ApiOperation({ summary: 'Get product variants' })
  getVariants(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.handleAsyncOperation(
      this.productsService.findAllVariants(productId),
    );
  }

  @Patch('variants/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update variant' })
  @Permissions('products.update')
  updateVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.handleAsyncOperation(
      this.productsService.updateVariant(id, dto),
    );
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete variant' })
  @Permissions('products.update')
  removeVariant(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.productsService.removeVariant(id));
  }

  // ==================== IMAGES ====================

  @Post(':productId/images')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add product image' })
  @Permissions('products.update')
  addImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.handleAsyncOperation(
      this.productsService.addImage(productId, dto),
    );
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove product image' })
  @Permissions('products.update')
  removeImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.productsService.removeImage(id));
  }

  // ==================== Q&A ====================

  @Get(':productId/questions')
  @ApiOperation({ summary: 'Get product questions' })
  getQuestions(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.handleAsyncOperation(
      this.productsService.getProductQuestions(productId),
    );
  }

  @Post(':productId/questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ask a question about product' })
  askQuestion(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body('question') question: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.productsService.askQuestion(productId, user.id, question),
    );
  }

  @Post('questions/:questionId/answers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Answer a product question' })
  answerQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body('answer') answer: string,
    @Body('isSellerAnswer') isSellerAnswer: boolean,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.productsService.answerQuestion(
        questionId,
        user.id,
        answer,
        isSellerAnswer,
      ),
    );
  }

  // ==================== PRICE HISTORY ====================

  @Get(':productId/price-history')
  @ApiOperation({ summary: 'Get product price history' })
  getPriceHistory(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.handleAsyncOperation(
      this.productsService.getPriceHistory(productId),
    );
  }

  @Get(':productId/related')
  @ApiOperation({ summary: 'Get related products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRelated(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.productsService.getRelatedProducts(productId, limit),
    );
  }
}
