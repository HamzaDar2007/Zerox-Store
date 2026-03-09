import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from 'src/modules/cart/cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart-item.entity';
import { Wishlist } from 'src/modules/cart/entities/wishlist.entity';
import { CheckoutSession } from 'src/modules/cart/entities/checkout-session.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { OrdersService } from 'src/modules/orders/orders.service';
import { MarketingService } from 'src/modules/marketing/marketing.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CartService – checkout & voucher features', () => {
  let service: CartService;
  let cartRepo: any;
  let cartItemRepo: any;
  let wishlistRepo: any;
  let checkoutSessionRepo: any;
  let productRepo: any;
  let ordersService: any;
  let marketingService: any;

  beforeEach(async () => {
    cartRepo = {
      findOne: jest.fn(),
      save: jest
        .fn()
        .mockImplementation((e) => Promise.resolve({ id: 'cart-1', ...e })),
    };
    cartItemRepo = {
      findOne: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    };
    wishlistRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    checkoutSessionRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
    };
    productRepo = {
      findOne: jest.fn(),
    };
    ordersService = {
      createFromCheckout: jest.fn().mockResolvedValue({
        success: true,
        data: { id: 'order-1' },
      }),
    };
    marketingService = {
      validateVoucher: jest.fn(),
      findVoucherByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: cartRepo },
        { provide: getRepositoryToken(CartItem), useValue: cartItemRepo },
        { provide: getRepositoryToken(Wishlist), useValue: wishlistRepo },
        {
          provide: getRepositoryToken(CheckoutSession),
          useValue: checkoutSessionRepo,
        },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: OrdersService, useValue: ordersService },
        { provide: MarketingService, useValue: marketingService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('completeCheckoutSession', () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      shippingAddressId: 'addr-1',
      paymentMethod: 'card',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      cartSnapshot: null,
      shippingAmount: 0,
      discountAmount: 0,
      giftWrapRequested: false,
      giftMessage: null,
      cart: {
        id: 'cart-1',
        voucherId: null,
        items: [
          {
            productId: 'prod-1',
            variantId: null,
            quantity: 2,
            priceAtAddition: 500,
            product: { name: 'Widget', sku: 'WID-1', images: ['img.jpg'] },
          },
        ],
      },
    };

    it('should create an order from checkout session and clear cart', async () => {
      checkoutSessionRepo.findOne.mockResolvedValue({ ...mockSession });

      const result = await service.completeCheckoutSession('session-1');

      expect(result.success).toBe(true);
      expect(result.data.orderId).toBe('order-1');
      expect(ordersService.createFromCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: 'prod-1',
              quantity: 2,
              unitPrice: 500,
            }),
          ]),
        }),
      );
      // Cart should be cleared
      expect(cartItemRepo.delete).toHaveBeenCalledWith({ cartId: 'cart-1' });
    });

    it('should throw if session not found', async () => {
      checkoutSessionRepo.findOne.mockResolvedValue(null);

      await expect(service.completeCheckoutSession('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if session expired', async () => {
      checkoutSessionRepo.findOne.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.completeCheckoutSession('session-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if cart is empty', async () => {
      checkoutSessionRepo.findOne.mockResolvedValue({
        ...mockSession,
        cart: { id: 'cart-1', items: [] },
      });

      await expect(
        service.completeCheckoutSession('session-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if no shipping address', async () => {
      checkoutSessionRepo.findOne.mockResolvedValue({
        ...mockSession,
        shippingAddressId: null,
        cartSnapshot: null,
      });

      await expect(
        service.completeCheckoutSession('session-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('applyVoucherToCart', () => {
    it('should apply a valid voucher to the cart', async () => {
      cartRepo.findOne
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1', items: [] }) // getOrCreateCart internal
        .mockResolvedValueOnce({
          id: 'cart-1',
          items: [{ priceAtAddition: 1000, quantity: 1 }],
        }); // subtotal calculation

      marketingService.validateVoucher.mockResolvedValue({
        data: { valid: true, discount: 100, message: '10% off' },
      });
      marketingService.findVoucherByCode.mockResolvedValue({
        data: { id: 'voucher-1' },
      });

      const result = await service.applyVoucherToCart('user-1', 'SALE10');

      expect(result.success).toBe(true);
      expect(result.data.discount).toBe(100);
      expect(cartRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          voucherId: 'voucher-1',
          discountAmount: 100,
        }),
      );
    });

    it('should throw for invalid voucher', async () => {
      cartRepo.findOne
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1', items: [] })
        .mockResolvedValueOnce({
          id: 'cart-1',
          items: [{ priceAtAddition: 500, quantity: 1 }],
        });

      marketingService.validateVoucher.mockResolvedValue({
        data: { valid: false, message: 'Code expired' },
      });

      await expect(
        service.applyVoucherToCart('user-1', 'EXPIRED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeVoucherFromCart', () => {
    it('should reset voucher fields on cart', async () => {
      cartRepo.findOne.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        voucherId: 'v-1',
        discountAmount: 50,
      });

      const result = await service.removeVoucherFromCart('user-1');

      expect(result.success).toBe(true);
      expect(cartRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ voucherId: null, discountAmount: 0 }),
      );
    });

    it('should throw if cart not found', async () => {
      cartRepo.findOne.mockResolvedValue(null);

      await expect(service.removeVoucherFromCart('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCartSummary', () => {
    it('should calculate correct subtotal and total', async () => {
      cartRepo.findOne.mockResolvedValue({
        id: 'cart-1',
        discountAmount: 50,
        items: [
          { priceAtAddition: 200, quantity: 2 },
          { priceAtAddition: 300, quantity: 1 },
        ],
      });

      const result = await service.getCartSummary('cart-1');

      expect(result.data.subtotal).toBe(700);
      expect(result.data.itemCount).toBe(3);
      expect(result.data.discount).toBe(50);
      expect(result.data.total).toBe(650);
    });
  });
});
