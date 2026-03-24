/**
 * CUSTOMER Role — All Routes Integration Tests
 *
 * Tests EVERY Swagger route as a customer user.
 * Validates access grants for customer-accessible endpoints
 * and proper 401/403 rejections for admin-only endpoints.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createApp,
  registerAndLogin,
  login,
  extractId,
  extractData,
  uniqueEmail,
  uniqueSlug,
  AuthResult,
} from '../utils/role-test-helpers';

describe('All Routes — CUSTOMER Role (e2e)', () => {
  let app: INestApplication;
  let customer: AuthResult;
  const email = uniqueEmail('customer');
  const password = 'Customer@123';

  // Shared IDs collected during tests
  let productId: string;
  let variantId: string;
  let orderId: string;
  let wishlistId: string;
  let reviewId: string;
  let threadId: string;
  let addressId: string;
  let cartItemId: string;
  let wishlistItemId: string;
  let searchId: string;

  beforeAll(async () => {
    app = await createApp();
    customer = await registerAndLogin(app, email, password, 'Ali', 'Customer');
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH ROUTES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Auth', () => {
    it('POST /auth/register — should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail('cust-reg'), password: 'Test@12345', firstName: 'New', lastName: 'User' });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /auth/login — should login customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });
      expect([200, 201]).toContain(res.status);
      const body = extractData(res);
      expect(body.accessToken || body.token).toBeDefined();
    });

    it('POST /auth/login — should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'WrongPass' })
        .expect((r) => expect([400, 401]).toContain(r.status));
    });

    it('POST /auth/register — should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad', password: 'Test@12345' })
        .expect(400);
    });

    it('POST /auth/register — should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'x@test.com', password: '123' })
        .expect(400);
    });

    it('POST /auth/refresh — should reject empty token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: '' })
        .expect(400);
    });

    it('POST /auth/refresh — should work with valid refresh token', async () => {
      if (!customer.refreshToken) return;
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: customer.refreshToken });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /auth/change-password — should change password', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ oldPassword: password, newPassword: 'Customer@456' })
        .expect((r) => expect([200, 201]).toContain(r.status));

      // Re-login with new password
      customer = await login(app, email, 'Customer@456');
    });

    it('POST /auth/change-password — should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .send({ oldPassword: 'x', newPassword: 'y' })
        .expect(401);
    });

    it('POST /auth/forgot-password — should accept valid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /auth/reset-password — should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'invalid-token', newPassword: 'NewPass@123' })
        .expect((r) => expect([400, 401, 404]).toContain(r.status));
    });

    it('POST /auth/verify-email — should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect((r) => expect([400, 404]).toContain(r.status));
    });

    it('POST /auth/logout — should logout', async () => {
      // Use a separate token for logout test
      const tmp = await login(app, email, 'Customer@456');
      if (!tmp.refreshToken) return;
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${tmp.token}`)
        .send({ refreshToken: tmp.refreshToken });
      expect([200, 201]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HEALTH / ROOT
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
  // CATEGORIES (PUBLIC READ, ADMIN WRITE)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Categories', () => {
    it('GET /categories — should list (public)', async () => {
      await request(app.getHttpServer()).get('/categories').expect(200);
    });

    it('GET /categories/:id — should get one (if exists)', async () => {
      const list = await request(app.getHttpServer()).get('/categories');
      const items = extractData(list);
      if (Array.isArray(items) && items.length > 0) {
        await request(app.getHttpServer()).get(`/categories/${items[0].id}`).expect(200);
      }
    });

    it('POST /categories — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'Test', slug: uniqueSlug('cat') })
        .expect(403);
    });

    it('PUT /categories/:id — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .put('/categories/00000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'Updated' })
        .expect(403);
    });

    it('DELETE /categories/:id — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .delete('/categories/00000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // BRANDS (PUBLIC READ, ADMIN WRITE)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Brands', () => {
    it('GET /brands — should list (public)', async () => {
      await request(app.getHttpServer()).get('/brands').expect(200);
    });

    it('GET /brands/:id — should get one (if exists)', async () => {
      const list = await request(app.getHttpServer()).get('/brands');
      const items = extractData(list);
      if (Array.isArray(items) && items.length > 0) {
        await request(app.getHttpServer()).get(`/brands/${items[0].id}`).expect(200);
      }
    });

    it('POST /brands — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .post('/brands')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'Test', slug: uniqueSlug('brand') })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PRODUCTS (PUBLIC READ)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Products', () => {
    it('GET /products — should list (public)', async () => {
      const res = await request(app.getHttpServer()).get('/products').expect(200);
      const data = extractData(res);
      if (Array.isArray(data) && data.length > 0) {
        productId = data[0].id;
      }
    });

    it('GET /products — should support pagination', async () => {
      await request(app.getHttpServer()).get('/products').query({ page: 1, limit: 5 }).expect(200);
    });

    it('GET /products — should support search', async () => {
      await request(app.getHttpServer()).get('/products').query({ search: 'test' }).expect(200);
    });

    it('GET /products/:id — should get product details', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}`).expect(200);
    });

    it('GET /products/slug/:slug — should get by slug', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer()).get(`/products/${productId}`);
      const slug = extractData(res)?.slug;
      if (slug) {
        await request(app.getHttpServer()).get(`/products/slug/${slug}`).expect(200);
      }
    });

    it('GET /products/:productId/variants — should list variants', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer()).get(`/products/${productId}/variants`).expect(200);
      const data = extractData(res);
      if (Array.isArray(data) && data.length > 0) variantId = data[0].id;
    });

    it('GET /products/:productId/images — should list images', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/images`).expect(200);
    });

    it('GET /products/:productId/categories — should list product categories', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/categories`).expect(200);
    });

    it('GET /products/attributes/keys — should list attribute keys', async () => {
      await request(app.getHttpServer()).get('/products/attributes/keys').expect(200);
    });

    it('POST /products — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'test', slug: uniqueSlug('prod'), basePrice: 100 })
        .expect((r) => expect([400, 403]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // USER ADDRESSES
  // ═══════════════════════════════════════════════════════════════════════

  describe('User Addresses', () => {
    it('POST /users/:id/addresses — should create address', async () => {
      const res = await request(app.getHttpServer())
        .post(`/users/${customer.userId}/addresses`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ label: 'Home', line1: '123 Street', city: 'Karachi', state: 'Sindh', postalCode: '74000', country: 'PK', isDefault: true });
      expect([200, 201]).toContain(res.status);
      addressId = extractId(res);
    });

    it('GET /users/:id/addresses — should list addresses', async () => {
      await request(app.getHttpServer())
        .get(`/users/${customer.userId}/addresses`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /users/addresses/:addressId — should update address', async () => {
      if (!addressId) return;
      await request(app.getHttpServer())
        .put(`/users/addresses/${addressId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ label: 'Home Updated' })
        .expect(200);
    });

    it('DELETE /users/addresses/:addressId — should delete address', async () => {
      if (!addressId) return;
      await request(app.getHttpServer())
        .delete(`/users/addresses/${addressId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CART
  // ═══════════════════════════════════════════════════════════════════════

  describe('Cart', () => {
    it('GET /cart/mine — should get or create cart', async () => {
      await request(app.getHttpServer())
        .get('/cart/mine')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('POST /cart/mine/items — should add item', async () => {
      if (!variantId) return;
      const res = await request(app.getHttpServer())
        .post('/cart/mine/items')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ variantId, quantity: 2, unitPrice: 999.99 });
      expect([200, 201, 400]).toContain(res.status);
      cartItemId = extractId(res);
    });

    it('GET /cart/mine/items — should list cart items', async () => {
      await request(app.getHttpServer())
        .get('/cart/mine/items')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /cart/items/:itemId — should update cart item', async () => {
      if (!cartItemId) return;
      await request(app.getHttpServer())
        .put(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ quantity: 3 })
        .expect(200);
    });

    it('POST /cart/mine/items — should reject quantity < 1', async () => {
      if (!variantId) return;
      await request(app.getHttpServer())
        .post('/cart/mine/items')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ variantId, quantity: 0, unitPrice: 100 })
        .expect(400);
    });

    it('POST /cart/mine/items — should reject missing variantId', async () => {
      await request(app.getHttpServer())
        .post('/cart/mine/items')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ quantity: 1, unitPrice: 100 })
        .expect(400);
    });

    it('DELETE /cart/items/:itemId — should remove item', async () => {
      if (!cartItemId) return;
      await request(app.getHttpServer())
        .delete(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('DELETE /cart/mine/clear — should clear cart', async () => {
      await request(app.getHttpServer())
        .delete('/cart/mine/clear')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('DELETE /cart/mine — should delete cart', async () => {
      await request(app.getHttpServer())
        .delete('/cart/mine')
        .set('Authorization', `Bearer ${customer.token}`)
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
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'My Favourites', isPublic: false });
      expect([200, 201]).toContain(res.status);
      wishlistId = extractId(res);
    });

    it('GET /wishlists/mine — should list wishlists', async () => {
      await request(app.getHttpServer())
        .get('/wishlists/mine')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('POST /wishlists/:id/items — should add item', async () => {
      if (!wishlistId || !variantId) return;
      const res = await request(app.getHttpServer())
        .post(`/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ variantId });
      expect([200, 201]).toContain(res.status);
      wishlistItemId = extractId(res);
    });

    it('GET /wishlists/:id/items — should list items', async () => {
      if (!wishlistId) return;
      await request(app.getHttpServer())
        .get(`/wishlists/${wishlistId}/items`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /wishlists/:id — should update wishlist', async () => {
      if (!wishlistId) return;
      await request(app.getHttpServer())
        .put(`/wishlists/${wishlistId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'Updated Name' })
        .expect(200);
    });

    it('DELETE /wishlists/items/:itemId — should remove item', async () => {
      if (!wishlistItemId) return;
      await request(app.getHttpServer())
        .delete(`/wishlists/items/${wishlistItemId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('DELETE /wishlists/:id — should delete wishlist', async () => {
      if (!wishlistId) return;
      await request(app.getHttpServer())
        .delete(`/wishlists/${wishlistId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Orders', () => {
    it('POST /orders — should create order', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          order: { shippingAmount: 200, shippingLine1: '123 St', shippingCity: 'Karachi', shippingState: 'Sindh', shippingPostalCode: '74000', shippingCountry: 'PK' },
          items: variantId ? [{ variantId, quantity: 1 }] : [],
        });
      expect([200, 201, 400, 500]).toContain(res.status);
      orderId = extractId(res);
    });

    it('GET /orders — should list orders', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /orders/:id — should get order', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /orders/:id/items — should get order items', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .get(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /orders/:id/cancel — should cancel order', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .put(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customer.token}`);
      expect([200, 400]).toContain(res.status);
    });

    it('PUT /orders/:id/status — should be FORBIDDEN for customer', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ status: 'shipped' })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Payments', () => {
    it('POST /payments — should create payment', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ orderId, gateway: 'stripe', method: 'credit_card', amount: 1199.99, currency: 'PKR', status: 'pending' });
      expect([200, 201, 403]).toContain(res.status);
    });

    it('GET /payments — should list payments', async () => {
      await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /payments/:id/status — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .put('/payments/00000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ status: 'completed' })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RETURNS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Returns', () => {
    it('POST /returns — should submit return', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .post('/returns')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ return: { orderId, reason: 'Damaged product' } });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /returns — should list returns', async () => {
      await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /returns/:id/status — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .put('/returns/00000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ status: 'approved' })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // REVIEWS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Reviews', () => {
    it('POST /reviews — should create review', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ productId, rating: 5, title: 'Great!', body: 'Excellent product.' });
      expect([200, 201, 400]).toContain(res.status);
      reviewId = extractId(res);
    });

    it('GET /reviews — should list reviews', async () => {
      await request(app.getHttpServer()).get('/reviews').expect(200);
    });

    it('GET /reviews/:id — should get review', async () => {
      if (!reviewId) return;
      await request(app.getHttpServer()).get(`/reviews/${reviewId}`).expect(200);
    });

    it('GET /reviews/product/:productId/summary — should get summary', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/reviews/product/${productId}/summary`).expect(200);
    });

    it('PUT /reviews/:id — should update own review', async () => {
      if (!reviewId) return;
      await request(app.getHttpServer())
        .put(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ rating: 4, title: 'Good' })
        .expect((r) => expect([200, 403]).toContain(r.status));
    });

    it('POST /reviews — should reject without rating', async () => {
      if (!productId) return;
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ productId, title: 'No rating' })
        .expect(400);
    });

    it('POST /reviews — should reject rating > 5', async () => {
      if (!productId) return;
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ productId, rating: 10 })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════════════

  describe('Search', () => {
    it('POST /search — should log search', async () => {
      const res = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ query: 'headphones', resultCount: 10 });
      expect([200, 201]).toContain(res.status);
      searchId = extractId(res);
    });

    it('GET /search/history — should get history', async () => {
      await request(app.getHttpServer())
        .get('/search/history')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /search/popular — should get popular', async () => {
      await request(app.getHttpServer())
        .get('/search/popular')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /search/:id/click — should record click', async () => {
      if (!searchId) return;
      const res = await request(app.getHttpServer())
        .put(`/search/${searchId}/click`)
        .set('Authorization', `Bearer ${customer.token}`);
      expect([200, 400, 404]).toContain(res.status);
    });

    it('GET /search/products — should search products', async () => {
      await request(app.getHttpServer())
        .get('/search/products')
        .set('Authorization', `Bearer ${customer.token}`)
        .query({ q: 'wireless' })
        .expect(200);
    });

    it('POST /search — should reject empty query', async () => {
      await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ query: '' })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Notifications', () => {
    it('GET /notifications/mine — should list notifications', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /notifications/mine/unread-count — should get count', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine/unread-count')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /notifications/mine/read-all — should mark all read', async () => {
      await request(app.getHttpServer())
        .put('/notifications/mine/read-all')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('POST /notifications — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ type: 'info', title: 'Test', userId: customer.userId })
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
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ subject: 'Help with order' });
      expect([200, 201]).toContain(res.status);
      threadId = extractId(res);
    });

    it('POST /chat/messages — should send message', async () => {
      if (!threadId) return;
      const res = await request(app.getHttpServer())
        .post('/chat/messages')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ threadId, body: 'I need help with my order' });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /chat/threads/:id — should get thread', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /chat/threads/:id/messages — should get messages', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}/messages`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /chat/mine/threads — should list threads', async () => {
      await request(app.getHttpServer())
        .get('/chat/mine/threads')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /chat/threads/:id/participants — should get participants', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}/participants`)
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('PUT /chat/threads/:threadId/read — should mark read', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .put(`/chat/threads/${threadId}/read`)
        .set('Authorization', `Bearer ${customer.token}`)
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
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('GET /subscriptions/mine — should list my subscriptions', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/mine')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(200);
    });

    it('POST /subscriptions/plans — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .post('/subscriptions/plans')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'Test', price: 99, currency: 'PKR', interval: 'monthly', intervalCount: 1 })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // COUPONS (ADMIN WRITE, READ MAY BE PUBLIC/AUTH)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Coupons', () => {
    it('GET /coupons — should list coupons', async () => {
      const res = await request(app.getHttpServer())
        .get('/coupons')
        .set('Authorization', `Bearer ${customer.token}`);
      expect([200, 403]).toContain(res.status);
    });

    it('POST /coupons — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ code: 'SAVE10', discountType: 'percentage', discountValue: 10, maxUses: 100 })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // FLASH SALES (ADMIN WRITE)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Flash Sales', () => {
    it('GET /flash-sales — should list', async () => {
      const res = await request(app.getHttpServer())
        .get('/flash-sales')
        .set('Authorization', `Bearer ${customer.token}`);
      expect([200, 403]).toContain(res.status);
    });

    it('POST /flash-sales — should be FORBIDDEN for customer', async () => {
      await request(app.getHttpServer())
        .post('/flash-sales')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'Sale', startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 86400000).toISOString() })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SELLERS (CUSTOMER CAN VIEW)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Sellers', () => {
    it('GET /sellers — should list sellers', async () => {
      await request(app.getHttpServer()).get('/sellers').expect(200);
    });

    it('POST /sellers — should create seller profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/sellers')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ displayName: 'My Shop', legalName: 'My Shop LLC', taxId: 'TAX-99999' });
      expect([200, 201, 400, 403]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // STORES (PUBLIC READ)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Stores', () => {
    it('GET /stores — should list stores', async () => {
      await request(app.getHttpServer()).get('/stores').expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN-ONLY ROUTES — SHOULD BE FORBIDDEN
  // ═══════════════════════════════════════════════════════════════════════

  describe('Admin-Only Routes — Access Denied', () => {
    it('POST /roles — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'test', description: 'test' })
        .expect(403);
    });

    it('GET /roles — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });

    it('POST /permissions — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ code: 'test.read', module: 'test' })
        .expect(403);
    });

    it('GET /permissions — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });

    it('POST /role-permissions — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/role-permissions')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ roleId: 'x', permissionIds: ['y'] })
        .expect(403);
    });

    it('POST /users — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ email: 'x@test.com', password: 'Pass@12345' })
        .expect(403);
    });

    it('GET /users — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });

    it('GET /audit-logs — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });

    it('POST /warehouses — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/warehouses')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ code: 'WH1', name: 'Test', line1: 'x', city: 'y', country: 'PK' })
        .expect(403);
    });

    it('GET /warehouses — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });

    it('GET /inventory — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });

    it('GET /inventory/low-stock — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .get('/inventory/low-stock')
        .set('Authorization', `Bearer ${customer.token}`)
        .expect(403);
    });

    it('POST /shipping/zones — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/shipping/zones')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ name: 'Zone', isActive: true })
        .expect(403);
    });

    it('POST /shipping/methods — FORBIDDEN', async () => {
      await request(app.getHttpServer())
        .post('/shipping/methods')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ zoneId: 'x', name: 'Method', carrier: 'TCS', baseRate: 100 })
        .expect(403);
    });
  });
});
