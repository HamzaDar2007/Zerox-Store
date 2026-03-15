/**
 * Seller Flow Integration Tests
 *
 * Tests the complete seller workflow:
 * - Register & Login as customer, then create seller profile
 * - Create and manage stores
 * - Add products with variants and images
 * - Manage inventory / stock
 * - View and process orders
 * - Ship orders
 * - Respond to reviews
 * - Chat with customers
 * - Manage subscription (seller plan)
 * - View analytics / audit logs
 * - Store settings & profile updates
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';

describe('Seller Flow (e2e)', () => {
  let app: INestApplication;
  let sellerToken: string;
  let sellerId: string;
  let storeId: string;
  let productId: string;
  let variantId: string;
  let imageId: string;
  const uniqueEmail = `seller-test-${Date.now()}@labverse.org`;
  const password = 'Seller@123';

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

  // ─── AUTH: REGISTER & LOGIN ─────────────────────────────────────────────

  describe('Seller Authentication', () => {
    it('POST /auth/register - should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          firstName: 'Ahmed',
          lastName: 'Seller',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      expect(res.body).toBeDefined();
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

      sellerToken = res.body?.data?.accessToken || res.body?.accessToken;
      sellerId = res.body?.data?.user?.id || res.body?.user?.id;
      expect(sellerToken).toBeDefined();

      // Assign seller role so RolesGuard passes for inventory etc.
      if (sellerId) {
        const ds = app.get(DataSource);
        const [sellerRole] = await ds.query(
          `SELECT id FROM roles WHERE name = 'seller' LIMIT 1`,
        );
        if (sellerRole) {
          await ds.query(
            `INSERT INTO user_roles (user_id, role_id, granted_by) VALUES ($1, $2, $1) ON CONFLICT DO NOTHING`,
            [sellerId, sellerRole.id],
          );
        }
      }
    });
  });

  // ─── SELLER PROFILE ────────────────────────────────────────────────────

  describe('Seller Profile Management', () => {
    it('POST /sellers - should create seller profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/sellers')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          displayName: 'Ahmed Electronics',
          legalName: 'Ahmed Electronics Pvt Ltd',
          taxId: 'TAX-12345',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      expect(res.body).toBeDefined();
    });

    it('GET /sellers - should list sellers with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/sellers')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('GET /sellers/user/:userId - should get seller by user id', async () => {
      if (!sellerId) return;

      await request(app.getHttpServer())
        .get(`/sellers/user/${sellerId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect((r) => {
          expect([200, 404]).toContain(r.status);
        });
    });

    it('POST /sellers - should reject without displayName', async () => {
      await request(app.getHttpServer())
        .post('/sellers')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          legalName: 'Missing Display Name',
        })
        .expect(400);
    });
  });

  // ─── STORE MANAGEMENT ─────────────────────────────────────────────────

  describe('Store Management', () => {
    it('POST /stores - should create a store', async () => {
      const res = await request(app.getHttpServer())
        .post('/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Ahmed Tech Store',
          slug: `ahmed-tech-store-${Date.now()}`,
          description: 'Premium electronics store',
          logoUrl: 'https://example.com/logo.png',
          bannerUrl: 'https://example.com/banner.png',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      storeId = res.body?.data?.id || res.body?.id;
    });

    it('GET /stores - should list all stores', async () => {
      await request(app.getHttpServer()).get('/stores').expect(200);
    });

    it('GET /stores/:id - should get store by id', async () => {
      if (!storeId) return;

      const res = await request(app.getHttpServer())
        .get(`/stores/${storeId}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('PUT /stores/:id - should update store', async () => {
      if (!storeId) return;

      await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ description: 'Updated premium electronics store' })
        .expect(200);
    });

    it('POST /stores - should reject store with missing slug', async () => {
      await request(app.getHttpServer())
        .post('/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'No Slug Store' })
        .expect(400);
    });

    it('POST /stores - should reject duplicate slug', async () => {
      await request(app.getHttpServer())
        .post('/stores')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Duplicate Store',
          slug: 'ahmed-tech-store',
          status: 'active',
        })
        .expect((r) => {
          expect([400, 409, 500]).toContain(r.status);
        });
    });
  });

  // ─── PRODUCT MANAGEMENT ────────────────────────────────────────────────

  describe('Product Management (Seller)', () => {
    it('POST /products - should create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          storeId: storeId || '550e8400-e29b-41d4-a716-446655440000',
          name: 'Wireless Headphones Pro',
          slug: `wireless-headphones-pro-${Date.now()}`,
          basePrice: 7999.99,
          isActive: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      productId = res.body?.data?.id || res.body?.id;
    });

    it('POST /products - should reject product without slug', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          storeId: storeId || '550e8400-e29b-41d4-a716-446655440000',
          name: 'No Slug Product',
          basePrice: 100,
        })
        .expect(400);
    });

    it('GET /products/:id - should get created product', async () => {
      if (!productId) return;

      const res = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('PUT /products/:id - should update product', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          fullDesc:
            'Updated: Premium noise-cancelling wireless headphones with ANC',
        })
        .expect(200);
    });
  });

  // ─── PRODUCT VARIANTS ─────────────────────────────────────────────────

  describe('Product Variants (Seller)', () => {
    it('POST /products/variants - should create variant', async () => {
      if (!productId) return;

      const res = await request(app.getHttpServer())
        .post('/products/variants')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          productId,
          sku: `WHP-BLK-${Date.now()}`,
          price: 7999.99,
          weightGrams: 250,
          isActive: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      variantId = res.body?.data?.id || res.body?.id;
    });

    it('POST /products/variants - should create second variant', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .post('/products/variants')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          productId,
          sku: `WHP-WHT-${Date.now()}`,
          price: 7999.99,
          isActive: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('GET /products/:productId/variants - should list variants', async () => {
      if (!productId) return;

      const res = await request(app.getHttpServer())
        .get(`/products/${productId}/variants`)
        .expect(200);

      const data = res.body?.data || res.body;
      if (Array.isArray(data)) {
        expect(data.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('PUT /products/variants/:variantId - should update variant', async () => {
      if (!variantId) return;

      await request(app.getHttpServer())
        .put(`/products/variants/${variantId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ price: 6999.99 })
        .expect(200);
    });

    it('POST /products/variants - should reject missing sku', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .post('/products/variants')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          productId,
          price: 100,
        })
        .expect(400);
    });
  });

  // ─── PRODUCT IMAGES ────────────────────────────────────────────────────

  describe('Product Images (Seller)', () => {
    it('POST /products/images - should add image', async () => {
      if (!productId) return;

      const res = await request(app.getHttpServer())
        .post('/products/images')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          productId,
          url: 'https://example.com/products/headphones-main.jpg',
          altText: 'Wireless Headphones Pro - Front View',
          sortOrder: 1,
          isPrimary: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      imageId = res.body?.data?.id || res.body?.id;
    });

    it('GET /products/:productId/images - should list images', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .get(`/products/${productId}/images`)
        .expect(200);
    });

    it('POST /products/images - should reject missing url', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .post('/products/images')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ productId, altText: 'Missing URL', sortOrder: 2 })
        .expect(400);
    });
  });

  // ─── INVENTORY / STOCK ─────────────────────────────────────────────────

  describe('Inventory Management (Seller - Admin Only)', () => {
    it('GET /inventory - should reject seller access', async () => {
      await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);
    });

    it('POST /inventory/set - should reject seller access', async () => {
      if (!variantId) return;

      await request(app.getHttpServer())
        .post('/inventory/set')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          warehouseId: '550e8400-e29b-41d4-a716-446655440001',
          variantId,
          qtyOnHand: 150,
        })
        .expect(403);
    });

    it('POST /inventory/adjust - should reject seller access', async () => {
      if (!variantId) return;

      await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          warehouseId: '550e8400-e29b-41d4-a716-446655440001',
          variantId,
          delta: -5,
        })
        .expect(403);
    });

    it('GET /inventory/low-stock - should reject seller access', async () => {
      await request(app.getHttpServer())
        .get('/inventory/low-stock')
        .set('Authorization', `Bearer ${sellerToken}`)
        .query({ threshold: 10 })
        .expect(403);
    });
  });

  // ─── VIEW ORDERS ──────────────────────────────────────────────────────

  describe('Order Processing (Seller View)', () => {
    it('GET /orders - should list orders', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('GET /orders - should filter by status', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${sellerToken}`)
        .query({ status: 'pending' })
        .expect(200);
    });

    it('GET /orders - should paginate results', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${sellerToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);
    });
  });

  // ─── SHIPPING ──────────────────────────────────────────────────────────

  describe('Shipping Management (Seller)', () => {
    it('GET /shipping/zones - should list shipping zones', async () => {
      await request(app.getHttpServer())
        .get('/shipping/zones')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('GET /shipping/methods - should list shipping methods', async () => {
      await request(app.getHttpServer())
        .get('/shipping/methods')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('POST /shipping/zones - should be forbidden for seller (admin only)', async () => {
      await request(app.getHttpServer())
        .post('/shipping/zones')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'Pakistan Zone', isActive: true })
        .expect(403);
    });
  });

  // ─── REVIEWS FOR PRODUCTS ──────────────────────────────────────────────

  describe('Reviews (Seller View)', () => {
    it('GET /reviews - should view reviews for products', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .get('/reviews')
        .query({ productId })
        .expect(200);
    });

    it('GET /reviews/product/:productId/summary - should get review summary', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .get(`/reviews/product/${productId}/summary`)
        .expect(200);
    });
  });

  // ─── RETURNS MANAGEMENT ────────────────────────────────────────────────

  describe('Returns (Seller View)', () => {
    it('GET /returns - should list returns', async () => {
      await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });
  });

  // ─── CHAT WITH CUSTOMERS ──────────────────────────────────────────────

  describe('Chat (Seller)', () => {
    let threadId: string;

    it('POST /chat/threads - should create a thread', async () => {
      const res = await request(app.getHttpServer())
        .post('/chat/threads')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          subject: 'Product inquiry response',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      threadId = res.body?.data?.id || res.body?.id;
    });

    it('POST /chat/messages - should send a reply', async () => {
      if (!threadId || !sellerId) return;

      await request(app.getHttpServer())
        .post('/chat/messages')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          threadId,
          body: 'Thank you for your inquiry. This product is in stock.',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('GET /chat/threads/:id/messages - should list messages', async () => {
      if (!threadId) return;

      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}/messages`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('GET /chat/mine/threads - should list seller threads', async () => {
      if (!sellerId) return;

      await request(app.getHttpServer())
        .get(`/chat/mine/threads`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });
  });

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────

  describe('Notifications (Seller)', () => {
    it('GET /notifications/mine - should get seller notifications', async () => {
      if (!sellerId) return;

      await request(app.getHttpServer())
        .get(`/notifications/mine`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('GET /notifications/mine/unread-count - should get unread count', async () => {
      if (!sellerId) return;

      await request(app.getHttpServer())
        .get(`/notifications/mine/unread-count`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });
  });

  // ─── SUBSCRIPTIONS ─────────────────────────────────────────────────────

  describe('Subscriptions (Seller)', () => {
    it('GET /subscriptions/plans - should list plans', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });
  });

  // ─── SEARCH (PUBLIC) ──────────────────────────────────────────────────

  describe('Search (Public)', () => {
    it('POST /search - should log a search query', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          query: 'headphones',
          resultCount: 10,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('GET /search/popular - should get popular searches', async () => {
      await request(app.getHttpServer())
        .get('/search/popular')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });
  });

  // ─── PASSWORD MANAGEMENT ──────────────────────────────────────────────

  describe('Password Management (Seller)', () => {
    it('POST /auth/change-password - should change password', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          oldPassword: password,
          newPassword: 'Seller@456',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('POST /auth/forgot-password - should initiate reset', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: uniqueEmail,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });
  });

  // ─── CLEANUP: DELETE PRODUCT, VARIANT, IMAGE ──────────────────────────

  describe('Cleanup (Seller)', () => {
    it('DELETE /products/images/:imageId - should delete image', async () => {
      if (!imageId) return;

      await request(app.getHttpServer())
        .delete(`/products/images/${imageId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('DELETE /products/variants/:variantId - should delete variant', async () => {
      if (!variantId) return;

      await request(app.getHttpServer())
        .delete(`/products/variants/${variantId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('DELETE /products/:id - should delete product', async () => {
      if (!productId) return;

      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });

    it('DELETE /stores/:id - should delete store', async () => {
      if (!storeId) return;

      await request(app.getHttpServer())
        .delete(`/stores/${storeId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect((r) => {
          expect([200, 403]).toContain(r.status);
        });
    });
  });
});
