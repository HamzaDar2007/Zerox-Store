import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Coupon } from './entities/coupon.entity';
import { CouponScope } from './entities/coupon-scope.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { FlashSaleItem } from './entities/flash-sale-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(Wishlist) private wishlistRepo: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private wishlistItemRepo: Repository<WishlistItem>,
    @InjectRepository(Coupon) private couponRepo: Repository<Coupon>,
    @InjectRepository(CouponScope)
    private couponScopeRepo: Repository<CouponScope>,
    @InjectRepository(FlashSale) private flashSaleRepo: Repository<FlashSale>,
    @InjectRepository(FlashSaleItem)
    private flashSaleItemRepo: Repository<FlashSaleItem>,
    private dataSource: DataSource,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      cart = await this.cartRepo.save(cart);
    }
    return cart;
  }

  async getOrCreateGuestCart(sessionId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({ where: { sessionId } });
    if (!cart) {
      cart = this.cartRepo.create({ sessionId });
      cart = await this.cartRepo.save(cart);
    }
    return cart;
  }

  async deleteCart(userId: string): Promise<void> {
    const cart = await this.cartRepo.findOne({ where: { userId } });
    if (cart) {
      await this.cartItemRepo.delete({ cartId: cart.id });
      await this.cartRepo.remove(cart);
    }
  }

  async addItem(userId: string, dto: Partial<CartItem>): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);
    const quantity = dto.quantity || 1;

    // Look up the variant price server-side
    const variant = await this.dataSource.query(
      'SELECT price FROM product_variants WHERE id = $1',
      [dto.variantId],
    );
    if (!variant?.length)
      throw new NotFoundException('Product variant not found');
    const unitPrice = Number(variant[0].price);

    // Atomic upsert: INSERT or increment quantity on conflict
    await this.dataSource.query(
      `INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cart_id, variant_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [cart.id, dto.variantId, quantity, unitPrice],
    );

    return this.cartItemRepo.findOne({
      where: { cartId: cart.id, variantId: dto.variantId },
    });
  }

  async updateItem(
    itemId: string,
    quantity: number,
    callerId: string,
  ): Promise<CartItem> {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart?.userId !== callerId)
      throw new ForbiddenException('You do not have access to this cart item');
    item.quantity = quantity;
    return this.cartItemRepo.save(item);
  }

  async removeItem(itemId: string, callerId: string): Promise<void> {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart?.userId !== callerId)
      throw new ForbiddenException('You do not have access to this cart item');
    await this.cartItemRepo.delete(itemId);
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const cart = await this.getOrCreateCart(userId);
    return this.cartItemRepo.find({
      where: { cartId: cart.id },
      relations: ['variant'],
    });
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepo.findOne({ where: { userId } });
    if (cart) await this.cartItemRepo.delete({ cartId: cart.id });
  }

  async createWishlist(userId: string, name?: string): Promise<Wishlist> {
    const wl = this.wishlistRepo.create({
      userId,
      name: name || 'My Wishlist',
    });
    return this.wishlistRepo.save(wl);
  }

  async getWishlists(userId: string): Promise<Wishlist[]> {
    return this.wishlistRepo.find({ where: { userId } });
  }

  async addToWishlist(
    wishlistId: string,
    variantId: string,
    callerId: string,
  ): Promise<WishlistItem> {
    const wl = await this.wishlistRepo.findOne({ where: { id: wishlistId } });
    if (!wl) throw new NotFoundException('Wishlist not found');
    if (wl.userId !== callerId)
      throw new ForbiddenException('You do not have access to this wishlist');
    const item = this.wishlistItemRepo.create({ wishlistId, variantId });
    return this.wishlistItemRepo.save(item);
  }

  async removeFromWishlist(itemId: string, callerId: string): Promise<void> {
    const item = await this.wishlistItemRepo.findOne({
      where: { id: itemId },
      relations: ['wishlist'],
    });
    if (!item) throw new NotFoundException('Wishlist item not found');
    if ((item as any).wishlist?.userId !== callerId)
      throw new ForbiddenException(
        'You do not have access to this wishlist item',
      );
    await this.wishlistItemRepo.delete(itemId);
  }

  async getWishlistItems(
    wishlistId: string,
    callerId: string,
  ): Promise<WishlistItem[]> {
    const wl = await this.wishlistRepo.findOne({ where: { id: wishlistId } });
    if (!wl) throw new NotFoundException('Wishlist not found');
    if (wl.userId !== callerId)
      throw new ForbiddenException('You do not have access to this wishlist');
    return this.wishlistItemRepo.find({
      where: { wishlistId },
      relations: ['variant'],
    });
  }

  async updateWishlist(
    wishlistId: string,
    callerId: string,
    dto: { name?: string; isPublic?: boolean },
  ): Promise<Wishlist> {
    const wl = await this.wishlistRepo.findOne({ where: { id: wishlistId } });
    if (!wl) throw new NotFoundException('Wishlist not found');
    if (wl.userId !== callerId)
      throw new ForbiddenException('You do not have access to this wishlist');
    if (dto.name !== undefined) wl.name = dto.name;
    if (dto.isPublic !== undefined) wl.isPublic = dto.isPublic;
    return this.wishlistRepo.save(wl);
  }

  async deleteWishlist(wishlistId: string, callerId: string): Promise<void> {
    const wl = await this.wishlistRepo.findOne({ where: { id: wishlistId } });
    if (!wl) throw new NotFoundException('Wishlist not found');
    if (wl.userId !== callerId)
      throw new ForbiddenException('You do not have access to this wishlist');
    await this.wishlistItemRepo.delete({ wishlistId });
    await this.wishlistRepo.remove(wl);
  }

  // ─── Coupons ───────────────────────────────────────────────────────────

  async createCoupon(dto: Partial<Coupon>): Promise<Coupon> {
    const coupon = this.couponRepo.create(dto);
    return this.couponRepo.save(coupon);
  }

  async findAllCoupons(page = 1, limit = 50): Promise<Coupon[]> {
    return this.couponRepo.find({
      order: { code: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findCoupon(id: string): Promise<Coupon> {
    const c = await this.couponRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Coupon not found');
    return c;
  }

  async findCouponByCode(code: string): Promise<Coupon> {
    const c = await this.couponRepo.findOne({ where: { code } });
    if (!c) throw new NotFoundException('Coupon not found');
    return c;
  }

  async updateCoupon(id: string, dto: Partial<Coupon>): Promise<Coupon> {
    const c = await this.findCoupon(id);
    Object.assign(c, dto);
    return this.couponRepo.save(c);
  }

  async removeCoupon(id: string): Promise<void> {
    const c = await this.findCoupon(id);
    await this.couponRepo.remove(c);
  }

  // ─── Coupon Scopes ─────────────────────────────────────────────────────

  async addCouponScope(dto: Partial<CouponScope>): Promise<CouponScope> {
    const scope = this.couponScopeRepo.create(dto);
    return this.couponScopeRepo.save(scope);
  }

  async findCouponScopes(couponId: string): Promise<CouponScope[]> {
    return this.couponScopeRepo.find({ where: { couponId } });
  }

  async removeCouponScope(id: string): Promise<void> {
    const scope = await this.couponScopeRepo.findOne({ where: { id } });
    if (!scope) throw new NotFoundException('Coupon scope not found');
    await this.couponScopeRepo.remove(scope);
  }

  // ─── Flash Sales ───────────────────────────────────────────────────────

  async createFlashSale(dto: Partial<FlashSale>): Promise<FlashSale> {
    if (dto.startsAt && dto.endsAt && dto.endsAt <= dto.startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    const sale = this.flashSaleRepo.create(dto);
    return this.flashSaleRepo.save(sale);
  }

  async findAllFlashSales(page = 1, limit = 50): Promise<FlashSale[]> {
    return this.flashSaleRepo.find({
      order: { startsAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findFlashSale(id: string): Promise<FlashSale> {
    const s = await this.flashSaleRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Flash sale not found');
    return s;
  }

  async updateFlashSale(
    id: string,
    dto: Partial<FlashSale>,
  ): Promise<FlashSale> {
    const s = await this.findFlashSale(id);
    Object.assign(s, dto);
    return this.flashSaleRepo.save(s);
  }

  async removeFlashSale(id: string): Promise<void> {
    const s = await this.findFlashSale(id);
    await this.flashSaleRepo.remove(s);
  }

  // ─── Flash Sale Items ──────────────────────────────────────────────────

  async addFlashSaleItem(dto: Partial<FlashSaleItem>): Promise<FlashSaleItem> {
    const item = this.flashSaleItemRepo.create(dto);
    return this.flashSaleItemRepo.save(item);
  }

  async findFlashSaleItems(flashSaleId: string): Promise<FlashSaleItem[]> {
    return this.flashSaleItemRepo.find({
      where: { flashSaleId },
      relations: ['variant'],
    });
  }

  async removeFlashSaleItem(id: string): Promise<void> {
    const item = await this.flashSaleItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Flash sale item not found');
    await this.flashSaleItemRepo.remove(item);
  }
}
