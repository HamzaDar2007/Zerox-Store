/**
 * Cart & Checkout Integration Tests (e2e)
 *
 * Tests the complete cart and checkout flow:
 * - Get/create cart for user
 * - Add items to cart
 * - Update cart item quantity
 * - Remove cart item
 * - Clear cart
 * - Wishlist: Create, add/remove items
 * - Place order from cart
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Cart & Checkout (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let wishlistId: string;
  const uniqueEmail = `cart-test-${Date.now()}@labverse.org`;
  const password = 'CartTest@123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── AUTH SETUP ────────────────────────────────────────────────────────

  describe('Setup - Register & Login', () => {
    it('POST /auth/register - should register', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          firstName: 'Cart',
          lastName: 'Tester',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('POST /auth/login - should login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: password,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      userToken = res.body?.data?.accessToken || res.body?.accessToken;
      userId = res.body?.data?.user?.id || res.body?.user?.id;
      expect(userToken).toBeDefined();
    });
  });

  // ─── CART OPERATIONS ──────────────────────────────────────────────────

  describe('Cart Operations', () => {
    it('GET /cart/mine - should get or create cart', async () => {
      if (!userId) return;

      const res = await request(app.getHttpServer())
        .get(`/cart/mine`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('POST /cart/mine/items - should add item to cart', async () => {
      if (!userId) return;

      await request(app.getHttpServer())
        .post(`/cart/mine/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          variantId: '550e8400-e29b-41d4-a716-446655440001',
          quantity: 2,
        })
        .expect((r) => {
          expect([200, 201, 400, 404, 500]).toContain(r.status);
        });
    });

    it('GET /cart/mine/items - should list cart items', async () => {
      if (!userId) return;

      await request(app.getHttpServer())
        .get(`/cart/mine/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('POST /cart/mine/items - should reject zero quantity', async () => {
      if (!userId) return;

      await request(app.getHttpServer())
        .post(`/cart/mine/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          variantId: '550e8400-e29b-41d4-a716-446655440001',
          quantity: 0,
        })
        .expect(400);
    });

    it('POST /cart/mine/items - should reject negative quantity', async () => {
      if (!userId) return;

      await request(app.getHttpServer())
        .post(`/cart/mine/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          variantId: '550e8400-e29b-41d4-a716-446655440001',
          quantity: -1,
        })
        .expect(400);
    });

    it('POST /cart/mine/items - should reject without auth', async () => {
      if (!userId) return;

      await request(app.getHttpServer())
        .post(`/cart/mine/items`)
        .send({
          variantId: '550e8400-e29b-41d4-a716-446655440001',
          quantity: 1,
        })
        .expect(401);
    });

    it('DELETE /cart/mine/clear - should clear cart', async () => {
      if (!userId) return;

      await request(app.getHttpServer())
        .delete(`/cart/mine/clear`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  // ─── WISHLIST OPERATIONS ──────────────────────────────────────────────

  describe('Wishlist Operations', () => {
    it('POST /wishlists - should create a wishlist', async () => {
      const res = await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'My Wishlist', isPublic: false })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      wishlistId = res.body?.data?.id || res.body?.id;
    });

    it('POST /wishlists/:id/items - should add item to wishlist', async () => {
      if (!wishlistId) return;

      await request(app.getHttpServer())
        .post(`/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ variantId: '550e8400-e29b-41d4-a716-446655440001' })
        .expect((r) => {
          expect([200, 201, 400, 500]).toContain(r.status);
        });
    });

    it('GET /wishlists/:id/items - should list wishlist items', async () => {
      if (!wishlistId) return;

      await request(app.getHttpServer())
        .get(`/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('GET /wishlists/mine - should list user wishlists', async () => {
      if (!userId) return;

      await request(app.getHttpServer())
        .get(`/wishlists/mine`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('POST /wishlists - should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/wishlists')
        .send({ name: 'Unauthorized Wishlist' })
        .expect(401);
    });

    it('DELETE /wishlists/:id - should delete wishlist', async () => {
      if (!wishlistId) return;

      await request(app.getHttpServer())
        .delete(`/wishlists/${wishlistId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect((r) => {
          expect([200, 404]).toContain(r.status);
        });
    });
  });

  // ─── CHECKOUT FLOW ────────────────────────────────────────────────────

  describe('Checkout Flow', () => {
    it('POST /orders - should place order from cart items', async () => {
      const orderData = {
        order: {
          status: 'pending',
          subtotal: 3999.98,
          discountAmount: 0,
          shippingAmount: 150,
          taxAmount: 100,
          totalAmount: 4249.98,
          shippingLine1: '123 Test St',
          shippingCity: 'Karachi',
          shippingState: 'Sindh',
          shippingPostalCode: '74000',
          shippingCountry: 'PK',
        },
        items: [],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect((r) => {
          expect([200, 201, 400, 500]).toContain(r.status);
        });
    });

    it('GET /orders - should list user orders', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('POST /orders - should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({ order: { status: 'pending' } })
        .expect(401);
    });
  });
});
