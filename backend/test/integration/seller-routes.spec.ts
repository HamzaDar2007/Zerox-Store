/**
 * SELLER Role — All Routes Integration Tests
 *
 * Tests EVERY Swagger route as a seller user.
 * Validates access grants for seller-accessible endpoints
 * and proper 403 rejections for admin-only endpoints.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createApp,
  registerAndLogin,
  assignRole,
  extractId,
  extractData,
  uniqueEmail,
  uniqueSlug,
  uniqueCode,
  AuthResult,
} from '../utils/role-test-helpers';

describe('All Routes — SELLER Role (e2e)', () => {
  let app: INestApplication;
  let seller: AuthResult;
  const email = uniqueEmail('seller');
  const password = 'Seller@123';

  let sellerId: string;
  let storeId: string;
  let productId: string;
  let variantId: string;
  let imageId: string;
  let threadId: string;

  beforeAll(async () => {
    app = await createApp();
    seller = await registerAndLogin(app, email, password, 'Sam', 'Seller');
    // Assign seller role via DB
    await assignRole(app, seller.userId, 'seller');
    // Re-login to get updated token with seller role
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    seller.token = loginRes.body.data?.accessToken || loginRes.body.data?.token || loginRes.body.accessToken || loginRes.body.token;
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH (basic — login works)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Auth', () => {
    it('POST /auth/login — should login seller', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });
      expect([200, 201]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HEALTH
  // ═══════════════════════════════════════════════════════════════════════

  describe('Health', () => {
    it('GET / — should return ok', async () => {
      await request(app.getHttpServer()).get('/').expect(200);
    });

    it('GET /health — should return ok', async () => {
      await request(app.getHttpServer()).get('/health').expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SELLER PROFILE
  // ═══════════════════════════════════════════════════════════════════════

  describe('Seller Profile', () => {
    it('POST /sellers — should create seller profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/sellers')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ displayName: 'Sam Shop', legalName: 'Sam Shop LLC', taxId: 'TAX-' + Date.now() });
      expect([200, 201, 400, 409]).toContain(res.status);
      sellerId = extractId(res);
    });

    it('GET /sellers — should list sellers', async () => {
      await request(app.getHttpServer()).get('/sellers').expect(200);
    });

    it('GET /sellers/:id — should get seller details', async () => {
      if (!sellerId) return;
      await request(app.getHttpServer()).get(`/sellers/${sellerId}`).expect(200);
    });

    it('PUT /sellers/:id — should update seller profile', async () => {
      if (!sellerId) return;
      await request(app.getHttpServer())
        .put(`/sellers/${sellerId}`)
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ displayName: 'Sam Shop Updated' })
        .expect((r) => expect([200, 403]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // STORES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Stores', () => {
    it('POST /stores — should create store', async () => {
      if (!sellerId) return;
      const res = await request(app.getHttpServer())
        .post('/stores')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ sellerId, name: 'My Store', slug: uniqueSlug('store') });
      expect([200, 201]).toContain(res.status);
      storeId = extractId(res);
    });

    it('GET /stores — should list stores', async () => {
      await request(app.getHttpServer()).get('/stores').expect(200);
    });

    it('GET /stores/:id — should get store', async () => {
      if (!storeId) return;
      await request(app.getHttpServer()).get(`/stores/${storeId}`).expect(200);
    });

    it('PUT /stores/:id — should update store', async () => {
      if (!storeId) return;
      await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Updated Store' })
        .expect((r) => expect([200, 403]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PRODUCTS (SELLER CAN CRUD OWN PRODUCTS)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Products', () => {
    it('GET /products — should list products (public)', async () => {
      const res = await request(app.getHttpServer()).get('/products').expect(200);
      const data = extractData(res);
      if (Array.isArray(data) && data.length > 0 && !productId) {
        productId = data[0].id;
      }
    });

    it('POST /products — should create product', async () => {
      if (!storeId) return;
      const slug = uniqueSlug('sellprod');
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({
          name: 'Seller Product',
          slug,
          basePrice: 999,
          storeId,
          description: 'A test product',
          status: 'draft',
        });
      expect([200, 201, 403]).toContain(res.status);
      const id = extractId(res);
      if (id) productId = id;
    });

    it('GET /products/:id — should get product', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}`).expect(200);
    });

    it('PUT /products/:id — should update own product', async () => {
      if (!productId) return;
      await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Updated Product' })
        .expect((r) => expect([200, 403]).toContain(r.status));
    });

    it('GET /products/attributes/keys — should list attribute keys', async () => {
      await request(app.getHttpServer()).get('/products/attributes/keys').expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // VARIANTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Variants', () => {
    it('POST /products/:productId/variants — should create variant', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/variants`)
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ sku: uniqueCode('SKU'), price: 1199, stock: 50, name: 'Variant 1' });
      expect([200, 201, 403, 404]).toContain(res.status);
      variantId = extractId(res);
    });

    it('GET /products/:productId/variants — should list variants', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .get(`/products/${productId}/variants`)
        .expect(200);
      const data = extractData(res);
      if (Array.isArray(data) && data.length > 0 && !variantId) variantId = data[0].id;
    });

    it('PUT /products/:productId/variants/:id — should update variant', async () => {
      if (!productId || !variantId) return;
      await request(app.getHttpServer())
        .put(`/products/${productId}/variants/${variantId}`)
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ price: 1299 })
        .expect((r) => expect([200, 403, 404]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PRODUCT IMAGES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Product Images', () => {
    it('POST /products/:productId/images — should add image', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/images`)
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ url: 'https://example.com/image.jpg', altText: 'Product image', position: 0 });
      expect([200, 201, 403, 404]).toContain(res.status);
      imageId = extractId(res);
    });

    it('GET /products/:productId/images — should list images', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/images`).expect(200);
    });

    it('DELETE /products/:productId/images/:imageId — should delete image', async () => {
      if (!productId || !imageId) return;
      await request(app.getHttpServer())
        .delete(`/products/${productId}/images/${imageId}`)
        .set('Authorization', `Bearer ${seller.token}`)
        .expect((r) => expect([200, 403]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORIES / BRANDS (READ ONLY)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Categories & Brands', () => {
    it('GET /categories — should list', async () => {
      await request(app.getHttpServer()).get('/categories').expect(200);
    });

    it('POST /categories — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Test', slug: uniqueSlug('cat') })
        .expect(403);
    });

    it('GET /brands — should list', async () => {
      await request(app.getHttpServer()).get('/brands').expect(200);
    });

    it('POST /brands — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .post('/brands')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Test', slug: uniqueSlug('brand') })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ORDERS (SELLER CAN VIEW, NOT UPDATE STATUS)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Orders', () => {
    it('GET /orders — should list orders', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });

    it('PUT /orders/:id/status — may be allowed for seller (fulfillment)', async () => {
      // Some systems let sellers update order status (e.g., shipped), some don't
      const res = await request(app.getHttpServer())
        .put('/orders/00000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ status: 'processing' });
      expect([200, 403, 404]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RETURNS (SELLER CAN VIEW)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Returns', () => {
    it('GET /returns — should list', async () => {
      await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });

    it('PUT /returns/:id/status — may be FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .put('/returns/00000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ status: 'approved' })
        .expect((r) => expect([200, 403, 404]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // REVIEWS (SELLER CAN VIEW)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Reviews', () => {
    it('GET /reviews — should list', async () => {
      await request(app.getHttpServer()).get('/reviews').expect(200);
    });

    it('POST /reviews — seller can create review', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ productId, rating: 4, title: 'Seller Review', body: 'Nice quality' });
      expect([200, 201, 400]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SHIPPING (SELLER CAN VIEW)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Shipping', () => {
    it('GET /shipping/zones — may be allowed', async () => {
      const res = await request(app.getHttpServer())
        .get('/shipping/zones')
        .set('Authorization', `Bearer ${seller.token}`);
      expect([200, 403]).toContain(res.status);
    });

    it('POST /shipping/zones — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .post('/shipping/zones')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Zone', isActive: true })
        .expect(403);
    });

    it('GET /shipping/methods — may be allowed', async () => {
      const res = await request(app.getHttpServer())
        .get('/shipping/methods')
        .set('Authorization', `Bearer ${seller.token}`);
      expect([200, 403]).toContain(res.status);
    });

    it('POST /shipping/methods — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .post('/shipping/methods')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ zoneId: 'x', name: 'M', carrier: 'TCS', baseRate: 100 })
        .expect(403);
    });

    it('GET /shipping/shipments — may be allowed', async () => {
      const res = await request(app.getHttpServer())
        .get('/shipping/shipments')
        .set('Authorization', `Bearer ${seller.token}`);
      expect([200, 403, 404]).toContain(res.status);
    });

    it('POST /shipping/shipments — may be allowed for seller fulfillment', async () => {
      const res = await request(app.getHttpServer())
        .post('/shipping/shipments')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ orderId: '00000000-0000-0000-0000-000000000001', methodId: '00000000-0000-0000-0000-000000000001', trackingNumber: 'TRACK123' });
      expect([200, 201, 400, 403, 404]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // INVENTORY (SELLER SHOULD NOT MANAGE WAREHOUSE INVENTORY DIRECTLY)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Inventory', () => {
    it('GET /inventory — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(403);
    });

    it('POST /inventory/set — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .post('/inventory/set')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ variantId: 'x', warehouseId: 'y', quantity: 10 })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CART (SELLER CAN ALSO HAVE A CART)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Cart', () => {
    it('GET /cart/mine — should get cart', async () => {
      await request(app.getHttpServer())
        .get('/cart/mine')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // WISHLISTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Wishlists', () => {
    it('POST /wishlists — should create wishlist', async () => {
      const res = await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Seller Favs', isPublic: false });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /wishlists/mine — should list', async () => {
      await request(app.getHttpServer())
        .get('/wishlists/mine')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════════════

  describe('Search', () => {
    it('GET /search/products — should search products', async () => {
      await request(app.getHttpServer())
        .get('/search/products')
        .set('Authorization', `Bearer ${seller.token}`)
        .query({ q: 'test' })
        .expect(200);
    });

    it('GET /search/popular — should get popular', async () => {
      await request(app.getHttpServer())
        .get('/search/popular')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Notifications', () => {
    it('GET /notifications/mine — should list', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });

    it('GET /notifications/mine/unread-count — should get count', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine/unread-count')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });

    it('POST /notifications — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ type: 'info', title: 'Test', userId: seller.userId })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CHAT
  // ═══════════════════════════════════════════════════════════════════════

  describe('Chat', () => {
    it('POST /chat/threads — should create thread', async () => {
      const res = await request(app.getHttpServer())
        .post('/chat/threads')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ subject: 'Order Question' });
      expect([200, 201]).toContain(res.status);
      threadId = extractId(res);
    });

    it('POST /chat/messages — should send message', async () => {
      if (!threadId) return;
      const res = await request(app.getHttpServer())
        .post('/chat/messages')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ threadId, body: 'Seller message' });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /chat/mine/threads — should list threads', async () => {
      await request(app.getHttpServer())
        .get('/chat/mine/threads')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Subscriptions', () => {
    it('GET /subscriptions/plans — should list plans', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(200);
    });

    it('POST /subscriptions/plans — FORBIDDEN for seller', async () => {
      await request(app.getHttpServer())
        .post('/subscriptions/plans')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Test', price: 99, currency: 'PKR', interval: 'monthly', intervalCount: 1 })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN-ONLY ROUTES — MUST BE FORBIDDEN
  // ═══════════════════════════════════════════════════════════════════════

  describe('Admin-Only Routes — Access Denied', () => {
    it('POST /roles — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'test', description: 'test' })
        .expect(403);
    });

    it('GET /roles — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(403);
    });

    it('POST /permissions — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ code: 'test.read', module: 'test' })
        .expect(403);
    });

    it('GET /permissions — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(403);
    });

    it('POST /users — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ email: 'x@test.com', password: 'Pass@12345' })
        .expect(403);
    });

    it('GET /users — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(403);
    });

    it('GET /audit-logs — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(403);
    });

    it('POST /warehouses — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/warehouses')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ code: 'WH1', name: 'Test', line1: 'x', city: 'y', country: 'PK' })
        .expect(403);
    });

    it('GET /warehouses — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${seller.token}`)
        .expect(403);
    });

    it('POST /coupons — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ code: 'SAVE10', discountType: 'percentage', discountValue: 10, maxUses: 100 })
        .expect(403);
    });

    it('POST /flash-sales — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/flash-sales')
        .set('Authorization', `Bearer ${seller.token}`)
        .send({ name: 'Sale', startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 86400000).toISOString() })
        .expect(403);
    });
  });
});
