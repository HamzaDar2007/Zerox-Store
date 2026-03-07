import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Wishlist } from './entities/wishlist.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { Product } from '../products/entities/product.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { CheckoutStep } from '@common/enums';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(CheckoutSession)
    private checkoutSessionRepository: Repository<CheckoutSession>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<ServiceResponse<Cart>> {
    let cart: Cart | null = null;
    if (userId) {
      cart = await this.cartRepository.findOne({ where: { userId }, relations: ['items', 'items.product', 'items.variant'] });
    } else if (sessionId) {
      cart = await this.cartRepository.findOne({ where: { sessionId }, relations: ['items', 'items.product', 'items.variant'] });
    }
    if (!cart) {
      const newCart = new Cart();
      newCart.userId = userId || null;
      newCart.sessionId = sessionId || null;
      newCart.currencyCode = 'PKR';
      cart = await this.cartRepository.save(newCart);
    }
    return { success: true, message: 'Cart retrieved', data: cart };
  }

  async getCart(userId: string): Promise<ServiceResponse<Cart>> {
    const result = await this.getOrCreateCart(userId);
    return result;
  }

  async getCartById(id: string): Promise<ServiceResponse<Cart>> {
    const cart = await this.cartRepository.findOne({ where: { id }, relations: ['items', 'items.product', 'items.variant'] });
    if (!cart) throw new NotFoundException('Cart not found');
    return { success: true, message: 'Cart retrieved', data: cart };
  }

  async addItem(userId: string, dto: { productId: string; variantId?: string; quantity?: number; priceAtAddition?: number }): Promise<ServiceResponse<CartItem>> {
    const cartResult = await this.getOrCreateCart(userId);
    const cart = cartResult.data!;
    
    let item = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId || null },
    });
    
    const qty = dto.quantity || 1;
    if (item) {
      item.quantity += qty;
    } else {
      // Look up the product price if not provided
      let price = dto.priceAtAddition;
      if (price === undefined || price === null || price <= 0) {
        const product = await this.productRepository.findOne({ where: { id: dto.productId } });
        if (!product) throw new NotFoundException('Product not found');
        price = Number(product.price) || 1;
      }

      item = new CartItem();
      item.cartId = cart.id;
      item.productId = dto.productId;
      item.variantId = dto.variantId || null;
      item.quantity = qty;
      item.priceAtAddition = price;
    }
    
    const savedItem = await this.cartItemRepository.save(item);
    return { success: true, message: 'Item added to cart', data: savedItem };
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<ServiceResponse<CartItem>> {
    const item = await this.cartItemRepository.findOne({ where: { id: itemId, cartId } });
    if (!item) throw new NotFoundException('Cart item not found');
    if (quantity <= 0) {
      await this.cartItemRepository.remove(item);
      return { success: true, message: 'Item removed from cart', data: item };
    }
    item.quantity = quantity;
    const saved = await this.cartItemRepository.save(item);
    return { success: true, message: 'Cart item updated', data: saved };
  }

  async updateItem(itemId: string, dto: { quantity?: number }, userId?: string): Promise<ServiceResponse<CartItem>> {
    const item = await this.cartItemRepository.findOne({ where: { id: itemId }, relations: ['cart'] });
    if (!item) throw new NotFoundException('Cart item not found');
    if (userId && item.cart && item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    if (dto.quantity !== undefined) {
      if (dto.quantity <= 0) {
        await this.cartItemRepository.remove(item);
        return { success: true, message: 'Item removed from cart', data: item };
      }
      item.quantity = dto.quantity;
    }
    const saved = await this.cartItemRepository.save(item);
    return { success: true, message: 'Cart item updated', data: saved };
  }

  async removeItem(itemId: string, userId?: string): Promise<ServiceResponse<void>> {
    const item = await this.cartItemRepository.findOne({ where: { id: itemId }, relations: ['cart'] });
    if (!item) throw new NotFoundException('Cart item not found');
    if (userId && item.cart && item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemRepository.remove(item);
    return { success: true, message: 'Item removed', data: undefined };
  }

  async clearCart(userId: string): Promise<ServiceResponse<void>> {
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (cart) {
      await this.cartItemRepository.delete({ cartId: cart.id });
    }
    return { success: true, message: 'Cart cleared', data: undefined };
  }

  async getCartSummary(cartId: string): Promise<ServiceResponse<{ subtotal: number; itemCount: number; discount: number; total: number }>> {
    const cart = await this.cartRepository.findOne({ where: { id: cartId }, relations: ['items', 'items.product'] });
    if (!cart) throw new NotFoundException('Cart not found');
    
    let subtotal = 0;
    let itemCount = 0;
    for (const item of cart.items || []) {
      subtotal += Number(item.priceAtAddition) * item.quantity;
      itemCount += item.quantity;
    }
    const discount = Number(cart.discountAmount) || 0;
    
    return { success: true, message: 'Cart summary', data: { subtotal, itemCount, discount, total: subtotal - discount } };
  }

  async addToWishlist(userId: string, dto: { productId: string }): Promise<ServiceResponse<Wishlist>> {
    const existing = await this.wishlistRepository.findOne({ where: { userId, productId: dto.productId } });
    if (existing) throw new BadRequestException('Item already in wishlist');
    const item = new Wishlist();
    item.userId = userId;
    item.productId = dto.productId;
    const saved = await this.wishlistRepository.save(item);
    return { success: true, message: 'Added to wishlist', data: saved };
  }

  async isInWishlist(userId: string, productId: string): Promise<ServiceResponse<{ isInWishlist: boolean }>> {
    const item = await this.wishlistRepository.findOne({ where: { userId, productId } });
    return { success: true, message: 'Wishlist check', data: { isInWishlist: !!item } };
  }

  async removeFromWishlist(userId: string, productId: string): Promise<ServiceResponse<void>> {
    const result = await this.wishlistRepository.delete({ userId, productId });
    if (!result.affected) throw new NotFoundException('Wishlist item not found');
    return { success: true, message: 'Removed from wishlist', data: undefined };
  }

  async getWishlist(userId: string): Promise<ServiceResponse<Wishlist[]>> {
    const items = await this.wishlistRepository.find({ where: { userId }, relations: ['product'], order: { createdAt: 'DESC' } });
    return { success: true, message: 'Wishlist retrieved', data: items };
  }

  async createCheckoutSession(userId: string, dto: { cartId?: string }): Promise<ServiceResponse<CheckoutSession>> {
    let cart;
    if (dto.cartId) {
      cart = await this.cartRepository.findOne({ where: { id: dto.cartId }, relations: ['items'] });
    } else {
      cart = await this.cartRepository.findOne({ where: { userId }, relations: ['items'] });
    }
    if (!cart || !cart.items?.length) throw new BadRequestException('Cart is empty');
    
    const session = new CheckoutSession();
    session.cartId = cart.id;
    session.userId = userId;
    session.sessionToken = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
    session.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const saved = await this.checkoutSessionRepository.save(session);
    return { success: true, message: 'Checkout session created', data: saved };
  }

  async updateCheckoutSession(sessionId: string, dto: any): Promise<ServiceResponse<CheckoutSession>> {
    const session = await this.checkoutSessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    Object.assign(session, dto);
    const saved = await this.checkoutSessionRepository.save(session);
    return { success: true, message: 'Session updated', data: saved };
  }

  async completeCheckoutSession(sessionId: string): Promise<ServiceResponse<CheckoutSession>> {
    const session = await this.checkoutSessionRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    session.step = CheckoutStep.COMPLETED;
    const saved = await this.checkoutSessionRepository.save(session);
    return { success: true, message: 'Session completed', data: saved };
  }

  async getCheckoutSession(sessionId: string): Promise<ServiceResponse<CheckoutSession>> {
    const session = await this.checkoutSessionRepository.findOne({ where: { id: sessionId }, relations: ['cart', 'cart.items'] });
    if (!session) throw new NotFoundException('Session not found');
    if (session.expiresAt < new Date()) throw new BadRequestException('Session expired');
    return { success: true, message: 'Session retrieved', data: session };
  }
}
