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
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateSellerDocumentDto } from './dto/create-seller-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Sellers')
@Controller('sellers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class SellersController extends BaseController {
  constructor(private readonly sellersService: SellersService) {
    super();
  }

  // ==================== SELLER ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Register as a seller' })
  @ApiResponse({ status: 201, description: 'Seller registered successfully' })
  create(@Body() dto: CreateSellerDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.sellersService.createSeller(dto, user.id),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all sellers' })
  @ApiResponse({ status: 200, description: 'Sellers retrieved successfully' })
  @Permissions('sellers.read')
  findAll() {
    return this.handleAsyncOperation(this.sellersService.findAllSellers());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seller by ID' })
  @ApiResponse({ status: 200, description: 'Seller retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.sellersService.findOneSeller(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update seller' })
  @ApiResponse({ status: 200, description: 'Seller updated successfully' })
  @Permissions('sellers.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSellerDto) {
    return this.handleAsyncOperation(this.sellersService.updateSeller(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete seller' })
  @ApiResponse({ status: 200, description: 'Seller deleted successfully' })
  @Permissions('sellers.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.sellersService.removeSeller(id));
  }

  // ==================== STORE ENDPOINTS ====================

  @Post(':sellerId/stores')
  @ApiOperation({ summary: 'Create store for seller' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  createStore(
    @Param('sellerId', ParseUUIDPipe) sellerId: string,
    @Body() dto: CreateStoreDto,
  ) {
    return this.handleAsyncOperation(
      this.sellersService.createStore(sellerId, dto),
    );
  }

  @Get(':sellerId/documents')
  @ApiOperation({ summary: 'Get seller documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  getDocuments(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.handleAsyncOperation(
      this.sellersService.getSellerDocuments(sellerId),
    );
  }

  @Post(':sellerId/documents')
  @ApiOperation({ summary: 'Upload seller document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  addDocument(
    @Param('sellerId', ParseUUIDPipe) sellerId: string,
    @Body() dto: CreateSellerDocumentDto,
  ) {
    return this.handleAsyncOperation(
      this.sellersService.addDocument(sellerId, dto),
    );
  }

  @Get(':sellerId/wallet')
  @ApiOperation({ summary: 'Get seller wallet' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  getWallet(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.handleAsyncOperation(
      this.sellersService.getSellerWallet(sellerId),
    );
  }

  @Get(':sellerId/wallet/transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  getTransactions(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.handleAsyncOperation(
      this.sellersService.getWalletTransactions(sellerId),
    );
  }

  @Get(':sellerId/stats')
  @ApiOperation({ summary: 'Get seller analytics/stats' })
  @ApiResponse({
    status: 200,
    description: 'Seller stats retrieved successfully',
  })
  getStats(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.handleAsyncOperation(
      this.sellersService.getSellerStats(sellerId),
    );
  }
}

@ApiTags('Stores')
@Controller('stores')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class StoresController extends BaseController {
  constructor(private readonly sellersService: SellersService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores' })
  @ApiResponse({ status: 200, description: 'Stores retrieved successfully' })
  findAll() {
    return this.handleAsyncOperation(this.sellersService.findAllStores());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.sellersService.findOneStore(id));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get store by slug' })
  @ApiResponse({ status: 200, description: 'Store retrieved successfully' })
  findBySlug(@Param('slug') slug: string) {
    return this.handleAsyncOperation(this.sellersService.findStoreBySlug(slug));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update store' })
  @ApiResponse({ status: 200, description: 'Store updated successfully' })
  @Permissions('stores.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStoreDto) {
    return this.handleAsyncOperation(this.sellersService.updateStore(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete store' })
  @ApiResponse({ status: 200, description: 'Store deleted successfully' })
  @Permissions('stores.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.sellersService.removeStore(id));
  }

  @Post(':id/follow')
  @ApiOperation({ summary: 'Follow a store' })
  @ApiResponse({ status: 201, description: 'Store followed successfully' })
  follow(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.sellersService.followStore(id, user.id),
    );
  }

  @Delete(':id/follow')
  @ApiOperation({ summary: 'Unfollow a store' })
  @ApiResponse({ status: 200, description: 'Store unfollowed successfully' })
  unfollow(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.sellersService.unfollowStore(id, user.id),
    );
  }
}
