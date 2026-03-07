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
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { UpdateCheckoutSessionDto } from './dto/update-checkout-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController extends BaseController {
  constructor(private readonly cartService: CartService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  getCart(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.cartService.getCart(user.id));
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  addItem(@Body() dto: CreateCartItemDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.cartService.addItem(user.id, dto));
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.cartService.updateItem(id, dto, user.id));
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  removeItem(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.cartService.removeItem(id, user.id));
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  clearCart(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.cartService.clearCart(user.id));
  }
}

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WishlistController extends BaseController {
  constructor(private readonly cartService: CartService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully' })
  getWishlist(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.cartService.getWishlist(user.id));
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  addToWishlist(@Body() dto: CreateWishlistDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.cartService.addToWishlist(user.id, dto));
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  removeFromWishlist(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.cartService.removeFromWishlist(user.id, productId));
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  isInWishlist(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.cartService.isInWishlist(user.id, productId));
  }
}

@ApiTags('Checkout')
@Controller('checkout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CheckoutController extends BaseController {
  constructor(private readonly cartService: CartService) {
    super();
  }

  @Post('session')
  @ApiOperation({ summary: 'Create checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  createSession(@Body() dto: CreateCheckoutSessionDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.cartService.createCheckoutSession(user.id, dto));
  }

  @Get('session/:id')
  @ApiOperation({ summary: 'Get checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session retrieved' })
  getSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cartService.getCheckoutSession(id));
  }

  @Patch('session/:id')
  @ApiOperation({ summary: 'Update checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session updated' })
  updateSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCheckoutSessionDto,
  ) {
    return this.handleAsyncOperation(this.cartService.updateCheckoutSession(id, dto));
  }

  @Post('session/:id/complete')
  @ApiOperation({ summary: 'Complete checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session completed' })
  completeSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.cartService.completeCheckoutSession(id));
  }
}
