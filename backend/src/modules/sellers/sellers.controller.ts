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
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { StorageService } from '../../common/services/storage.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Sellers')
@Controller('sellers')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class SellersController {
  constructor(private readonly svc: SellersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register as a seller' })
  @ApiResponse({ status: 201, description: 'Seller profile created' })
  @Auditable({ action: 'CREATE', tableName: 'sellers' })
  create(@Body() dto: CreateSellerDto, @Req() req: any) {
    return this.svc.createSeller({ ...dto, userId: req.user.id });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all sellers' })
  @ApiResponse({ status: 200, description: 'Sellers list returned' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAllSellers(
      page ? Math.max(1, +page) : 1,
      limit ? Math.min(Math.max(1, +limit), 100) : 20,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get seller by ID' })
  @ApiParam({ name: 'id', description: 'Seller UUID' })
  @ApiResponse({ status: 200, description: 'Seller found' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  findOne(@Param('id') id: string) {
    return this.svc.findSeller(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update seller profile (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Seller UUID' })
  @ApiResponse({ status: 200, description: 'Seller updated' })
  @Auditable({ action: 'UPDATE', tableName: 'sellers' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSellerDto,
    @Req() req: any,
  ) {
    return this.svc.updateSeller(id, dto, req.user.id, req.user.role);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve a seller (Admin only)' })
  @ApiParam({ name: 'id', description: 'Seller UUID' })
  @ApiResponse({ status: 200, description: 'Seller approved' })
  @Auditable({ action: 'UPDATE', tableName: 'sellers' })
  approve(@Param('id') id: string, @Req() req: any) {
    return this.svc.approveSeller(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a seller (Admin only)' })
  @ApiParam({ name: 'id', description: 'Seller UUID' })
  @ApiResponse({ status: 200, description: 'Seller deleted' })
  @Auditable({ action: 'DELETE', tableName: 'sellers' })
  remove(@Param('id') id: string) {
    return this.svc.removeSeller(id);
  }
}

@ApiTags('Stores')
@Controller('stores')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class StoresController {
  constructor(
    private readonly svc: SellersService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created' })
  @Auditable({ action: 'CREATE', tableName: 'stores' })
  create(@Body() dto: CreateStoreDto, @Req() req: any) {
    return this.svc.createStoreForUser(req.user.id, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all stores' })
  @ApiResponse({ status: 200, description: 'Stores list returned' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAllStores(
      page ? Math.max(1, +page) : 1,
      limit ? Math.min(Math.max(1, +limit), 100) : 20,
    );
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find store by slug' })
  @ApiParam({ name: 'slug', description: 'Store URL slug' })
  @ApiResponse({ status: 200, description: 'Store found' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findStoreBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 200, description: 'Store found' })
  findOne(@Param('id') id: string) {
    return this.svc.findStore(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update store details (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 200, description: 'Store updated' })
  @Auditable({ action: 'UPDATE', tableName: 'stores' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @Req() req: any,
  ) {
    return this.svc.updateStore(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a store' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 200, description: 'Store deleted' })
  @Auditable({ action: 'DELETE', tableName: 'stores' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.svc.removeStore(id, req.user.id, req.user.role);
  }

  @Patch(':id/logo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload store logo to R2' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Store logo updated' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const logoUrl = await this.storage.upload(file, 'stores');
    return this.svc.updateStore(
      id,
      { logoUrl } as any,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/banner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload store banner to R2' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Store banner updated' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadBanner(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const bannerUrl = await this.storage.upload(file, 'stores');
    return this.svc.updateStore(
      id,
      { bannerUrl } as any,
      req.user.id,
      req.user.role,
    );
  }
}
