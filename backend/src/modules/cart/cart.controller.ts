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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { CreateFlashSaleItemDto } from './dto/create-flash-sale-item.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CartController {
  constructor(private readonly svc: CartService) {}

  @Get('mine')
  @ApiOperation({ summary: 'Get cart for current user' })
  @ApiResponse({ status: 200, description: 'Cart returned' })
  getCart(@CurrentUser() user: any) {
    return this.svc.getOrCreateCart(user.id);
  }

  @Get('mine/items')
  @ApiOperation({ summary: 'Get all items in cart' })
  @ApiResponse({ status: 200, description: 'Cart items returned' })
  getItems(@CurrentUser() user: any) {
    return this.svc.getCartItems(user.id);
  }

  @Post('mine/items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  addItem(@CurrentUser() user: any, @Body() dto: CreateCartItemDto) {
    return this.svc.addItem(user.id, dto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'itemId', description: 'Cart item UUID' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateItem(itemId, dto.quantity, user.id);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', description: 'Cart item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  removeItem(@Param('itemId') itemId: string, @CurrentUser() user: any) {
    return this.svc.removeItem(itemId, user.id);
  }

  @Delete('mine/clear')
  @ApiOperation({ summary: 'Clear all items in cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  clearCart(@CurrentUser() user: any) {
    return this.svc.clearCart(user.id);
  }

  @Delete('mine')
  @ApiOperation({ summary: 'Delete cart entirely' })
  @ApiResponse({ status: 200, description: 'Cart deleted' })
  deleteCart(@CurrentUser() user: any) {
    return this.svc.deleteCart(user.id);
  }
}

@ApiTags('Wishlists')
@Controller('wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class WishlistController {
  constructor(private readonly svc: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wishlist' })
  @ApiResponse({ status: 201, description: 'Wishlist created' })
  create(@Body() dto: CreateWishlistDto, @CurrentUser() user: any) {
    return this.svc.createWishlist(user.id, dto.name);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get all wishlists for current user' })
  @ApiResponse({ status: 200, description: 'Wishlists returned' })
  getWishlists(@CurrentUser() user: any) {
    return this.svc.getWishlists(user.id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to wishlist' })
  @ApiParam({ name: 'id', description: 'Wishlist UUID' })
  @ApiResponse({ status: 201, description: 'Item added to wishlist' })
  addItem(
    @Param('id') id: string,
    @Body() dto: CreateWishlistItemDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.addToWishlist(id, dto.variantId, user.id);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get all items in a wishlist' })
  @ApiParam({ name: 'id', description: 'Wishlist UUID' })
  @ApiResponse({ status: 200, description: 'Wishlist items returned' })
  getItems(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.getWishlistItems(id, user.id);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  @ApiParam({ name: 'itemId', description: 'Wishlist item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed from wishlist' })
  removeItem(@Param('itemId') itemId: string, @CurrentUser() user: any) {
    return this.svc.removeFromWishlist(itemId, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a wishlist' })
  @ApiParam({ name: 'id', description: 'Wishlist UUID' })
  @ApiResponse({ status: 200, description: 'Wishlist updated' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWishlistDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateWishlist(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wishlist' })
  @ApiParam({ name: 'id', description: 'Wishlist UUID' })
  @ApiResponse({ status: 200, description: 'Wishlist deleted' })
  deleteWishlist(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.deleteWishlist(id, user.id);
  }
}

@ApiTags('Coupons')
@Controller('coupons')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CouponsController {
  constructor(private readonly svc: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a coupon (Admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon created' })
  create(@Body() dto: CreateCouponDto) {
    return this.svc.createCoupon(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all coupons (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Coupons list returned' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAllCoupons(+(page || 1), +(limit || 50));
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find coupon by code' })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  @ApiResponse({ status: 200, description: 'Coupon found' })
  findByCode(@Param('code') code: string) {
    return this.svc.findCouponByCode(code);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get coupon by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 200, description: 'Coupon found' })
  findOne(@Param('id') id: string) {
    return this.svc.findCoupon(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a coupon (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 200, description: 'Coupon updated' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.svc.updateCoupon(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a coupon (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 200, description: 'Coupon deleted' })
  remove(@Param('id') id: string) {
    return this.svc.removeCoupon(id);
  }

  @Post(':id/scopes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add scope to coupon (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 201, description: 'Coupon scope added' })
  addScope(@Param('id') id: string, @Body() dto: any) {
    return this.svc.addCouponScope({ ...dto, couponId: id });
  }

  @Get(':id/scopes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List scopes for a coupon (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiResponse({ status: 200, description: 'Coupon scopes returned' })
  findScopes(@Param('id') id: string) {
    return this.svc.findCouponScopes(id);
  }

  @Delete('scopes/:scopeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove a coupon scope (Admin only)' })
  @ApiParam({ name: 'scopeId', description: 'Scope UUID' })
  @ApiResponse({ status: 200, description: 'Coupon scope removed' })
  removeScope(@Param('scopeId') scopeId: string) {
    return this.svc.removeCouponScope(scopeId);
  }
}

@ApiTags('Flash Sales')
@Controller('flash-sales')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class FlashSalesController {
  constructor(private readonly svc: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a flash sale (Admin only)' })
  @ApiResponse({ status: 201, description: 'Flash sale created' })
  create(@Body() dto: CreateFlashSaleDto) {
    return this.svc.createFlashSale(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all flash sales' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Flash sales list returned' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAllFlashSales(+(page || 1), +(limit || 50));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get flash sale by ID' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiResponse({ status: 200, description: 'Flash sale found' })
  findOne(@Param('id') id: string) {
    return this.svc.findFlashSale(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a flash sale (Admin only)' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiResponse({ status: 200, description: 'Flash sale updated' })
  update(@Param('id') id: string, @Body() dto: UpdateFlashSaleDto) {
    return this.svc.updateFlashSale(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a flash sale (Admin only)' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiResponse({ status: 200, description: 'Flash sale deleted' })
  remove(@Param('id') id: string) {
    return this.svc.removeFlashSale(id);
  }

  @Post(':id/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add an item to a flash sale (Admin only)' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiResponse({ status: 201, description: 'Flash sale item added' })
  addItem(@Param('id') id: string, @Body() dto: CreateFlashSaleItemDto) {
    return this.svc.addFlashSaleItem({ ...dto, flashSaleId: id });
  }

  @Get(':id/items')
  @Public()
  @ApiOperation({ summary: 'List items in a flash sale' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiResponse({ status: 200, description: 'Flash sale items returned' })
  findItems(@Param('id') id: string) {
    return this.svc.findFlashSaleItems(id);
  }

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove item from flash sale (Admin only)' })
  @ApiParam({ name: 'itemId', description: 'Flash sale item UUID' })
  @ApiResponse({ status: 200, description: 'Flash sale item removed' })
  removeItem(@Param('itemId') itemId: string) {
    return this.svc.removeFlashSaleItem(itemId);
  }
}
