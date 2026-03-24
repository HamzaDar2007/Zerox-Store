/**
 * ADMIN Role — All Routes Integration Tests
 *
 * Tests EVERY Swagger route as an admin user.
 * Admin bypasses RolesGuard but NOT PermissionsGuard (only super_admin does).
 * Tests full CRUD on most resources.
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

describe('All Routes — ADMIN Role (e2e)', () => {
  let app: INestApplication;
  let admin: AuthResult;
  const email = uniqueEmail('admin');
  const password = 'Admin@123';

  // Shared IDs
  let roleId: string;
  let permissionId: string;
  let categoryId: string;
  let brandId: string;
  let productId: string;
  let variantId: string;
  let imageId: string;
  let warehouseId: string;
  let zoneId: string;
  let shippingMethodId: string;
  let couponId: string;
  let flashSaleId: string;
  let orderId: string;
  let returnId: string;
  let reviewId: string;
  let planId: string;
  let userId: string;
  let threadId: string;
  let notificationId: string;

  beforeAll(async () => {
    app = await createApp();
    admin = await registerAndLogin(app, email, password, 'Amy', 'Admin');
    await assignRole(app, admin.userId, 'admin');
    // Re-login for updated role token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    admin.token = loginRes.body.data?.accessToken || loginRes.body.data?.token || loginRes.body.accessToken || loginRes.body.token;
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════

  describe('Auth', () => {
    it('POST /auth/login — should login admin', async () => {
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
    it('GET / — ok', async () => {
      await request(app.getHttpServer()).get('/').expect(200);
    });
    it('GET /health — ok', async () => {
      await request(app.getHttpServer()).get('/health').expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ROLES (ADMIN BYPASSES ROLES GUARD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Roles', () => {
    it('POST /roles — should create role', async () => {
      const res = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: uniqueSlug('role'), description: 'Test role' });
      expect([200, 201]).toContain(res.status);
      roleId = extractId(res);
    });

    it('GET /roles — should list roles', async () => {
      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /roles/:id — should get role', async () => {
      if (!roleId) return;
      await request(app.getHttpServer())
        .get(`/roles/${roleId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /roles/:id — should update role', async () => {
      if (!roleId) return;
      await request(app.getHttpServer())
        .put(`/roles/${roleId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ description: 'Updated description' })
        .expect(200);
    });

    it('DELETE /roles/:id — should delete role', async () => {
      if (!roleId) return;
      await request(app.getHttpServer())
        .delete(`/roles/${roleId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Permissions', () => {
    it('POST /permissions — should create permission', async () => {
      const res = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ code: uniqueCode('perm') + '.read', module: 'test', description: 'Test permission' });
      expect([200, 201]).toContain(res.status);
      permissionId = extractId(res);
    });

    it('GET /permissions — should list', async () => {
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /permissions/:id — should get one', async () => {
      if (!permissionId) return;
      await request(app.getHttpServer())
        .get(`/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /permissions/by-module — should get by module', async () => {
      await request(app.getHttpServer())
        .get('/permissions/by-module')
        .query({ module: 'test' })
        .set('Authorization', `Bearer ${admin.token}`)
        .expect((r) => expect([200, 400]).toContain(r.status));
    });

    it('DELETE /permissions/:id — should delete', async () => {
      if (!permissionId) return;
      await request(app.getHttpServer())
        .delete(`/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ROLE-PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Role-Permissions', () => {
    it('POST /role-permissions — should assign permission to role', async () => {
      // Create a fresh role and permission first
      const roleRes = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: uniqueSlug('rp-role'), description: 'RP test' });
      const pRes = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ code: uniqueCode('rp') + '.read', module: 'rp', description: 'RP test' });
      const rId = extractId(roleRes);
      const pId = extractId(pRes);
      if (!rId || !pId) return;
      const res = await request(app.getHttpServer())
        .post('/role-permissions')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ roleId: rId, permissionIds: [pId] });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /role-permissions/:roleId — should list by role', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${admin.token}`);
      const roles = extractData(listRes);
      if (Array.isArray(roles) && roles.length > 0) {
        await request(app.getHttpServer())
          .get(`/role-permissions/${roles[0].id}`)
          .set('Authorization', `Bearer ${admin.token}`)
          .expect(200);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Users', () => {
    it('POST /users — should create user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ email: uniqueEmail('admin-u'), password: 'Pass@12345', firstName: 'New', lastName: 'User' });
      expect([200, 201]).toContain(res.status);
      userId = extractId(res);
    });

    it('GET /users — should list users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /users/:id — should get user', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /users/:id — should update user', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ firstName: 'Updated' })
        .expect(200);
    });

    it('GET /users/:id/roles — should get user roles', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .get(`/users/${userId}/roles`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('POST /users/:id/roles — should assign role', async () => {
      if (!userId) return;
      const rolesRes = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${admin.token}`);
      const roles = extractData(rolesRes);
      if (Array.isArray(roles) && roles.length > 0) {
        const res = await request(app.getHttpServer())
          .post(`/users/${userId}/roles`)
          .set('Authorization', `Bearer ${admin.token}`)
          .send({ roleId: roles[0].id });
        expect([200, 201, 409]).toContain(res.status);
      }
    });

    it('POST /users/:id/addresses — should create address for user', async () => {
      if (!userId) return;
      const res = await request(app.getHttpServer())
        .post(`/users/${userId}/addresses`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ label: 'Office', line1: '456 Ave', city: 'Lahore', state: 'Punjab', postalCode: '54000', country: 'PK' });
      expect([200, 201]).toContain(res.status);
    });

    it('DELETE /users/:id — should delete user', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Categories', () => {
    it('POST /categories — should create category', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Admin Cat', slug: uniqueSlug('acat') });
      expect([200, 201]).toContain(res.status);
      categoryId = extractId(res);
    });

    it('GET /categories — should list', async () => {
      await request(app.getHttpServer()).get('/categories').expect(200);
    });

    it('GET /categories/:id — should get', async () => {
      if (!categoryId) return;
      await request(app.getHttpServer()).get(`/categories/${categoryId}`).expect(200);
    });

    it('PUT /categories/:id — should update', async () => {
      if (!categoryId) return;
      await request(app.getHttpServer())
        .put(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Updated Cat' })
        .expect(200);
    });

    it('DELETE /categories/:id — should delete', async () => {
      if (!categoryId) return;
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // BRANDS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Brands', () => {
    it('POST /brands — should create brand', async () => {
      const res = await request(app.getHttpServer())
        .post('/brands')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Admin Brand', slug: uniqueSlug('abrand') });
      expect([200, 201]).toContain(res.status);
      brandId = extractId(res);
    });

    it('GET /brands — should list', async () => {
      await request(app.getHttpServer()).get('/brands').expect(200);
    });

    it('PUT /brands/:id — should update', async () => {
      if (!brandId) return;
      await request(app.getHttpServer())
        .put(`/brands/${brandId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Updated Brand' })
        .expect(200);
    });

    it('DELETE /brands/:id — should delete', async () => {
      if (!brandId) return;
      await request(app.getHttpServer())
        .delete(`/brands/${brandId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Products', () => {
    it('POST /products — should create product', async () => {
      // Need a storeId. Try to get one from existing stores, or create one.
      const storesRes = await request(app.getHttpServer()).get('/stores');
      const stores = extractData(storesRes);
      const storeId = Array.isArray(stores) && stores.length > 0 ? stores[0].id : null;
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ slug: uniqueSlug('aprod'), basePrice: 500, storeId: storeId || '00000000-0000-0000-0000-000000000001' });
      expect([200, 201, 400]).toContain(res.status);
      productId = extractId(res);
    });

    it('GET /products — should list', async () => {
      await request(app.getHttpServer()).get('/products').expect(200);
    });

    it('GET /products/:id — should get', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}`).expect(200);
    });

    it('PUT /products/:id — should update', async () => {
      if (!productId) return;
      await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Updated Product' })
        .expect(200);
    });

    // Variants
    it('POST /products/:id/variants — should create variant', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/variants`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ sku: uniqueCode('ASKU'), price: 599, stock: 100, name: 'Admin V1' });
      expect([200, 201, 404]).toContain(res.status);
      variantId = extractId(res);
    });

    it('GET /products/:id/variants — should list', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/variants`).expect(200);
    });

    it('PUT /products/:id/variants/:variantId — should update', async () => {
      if (!productId || !variantId) return;
      await request(app.getHttpServer())
        .put(`/products/${productId}/variants/${variantId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ price: 699 })
        .expect(200);
    });

    // Images
    it('POST /products/:id/images — should add image', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/images`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ url: 'https://example.com/admin-img.jpg', altText: 'Admin image', position: 0 });
      expect([200, 201, 404]).toContain(res.status);
      imageId = extractId(res);
    });

    it('GET /products/:id/images — should list images', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/images`).expect(200);
    });

    it('DELETE /products/:id/images/:imageId — should delete image', async () => {
      if (!productId || !imageId) return;
      await request(app.getHttpServer())
        .delete(`/products/${productId}/images/${imageId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    // Categories
    it('GET /products/:id/categories — should list product categories', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/categories`).expect(200);
    });

    // Attribute keys
    it('GET /products/attributes/keys — should list attribute keys', async () => {
      await request(app.getHttpServer()).get('/products/attributes/keys').expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // WAREHOUSES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Warehouses', () => {
    it('POST /warehouses — should create warehouse', async () => {
      const res = await request(app.getHttpServer())
        .post('/warehouses')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ code: uniqueCode('AWH'), name: 'Admin WH', line1: '123 WH St', city: 'Karachi', country: 'PK', isActive: true });
      expect([200, 201]).toContain(res.status);
      warehouseId = extractId(res);
    });

    it('GET /warehouses — should list', async () => {
      await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /warehouses/:id — should get', async () => {
      if (!warehouseId) return;
      await request(app.getHttpServer())
        .get(`/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /warehouses/:id — should update', async () => {
      if (!warehouseId) return;
      await request(app.getHttpServer())
        .put(`/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Updated WH' })
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // INVENTORY
  // ═══════════════════════════════════════════════════════════════════════

  describe('Inventory', () => {
    it('POST /inventory/set — should set stock', async () => {
      if (!variantId || !warehouseId) return;
      const res = await request(app.getHttpServer())
        .post('/inventory/set')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ variantId, warehouseId, quantity: 50 });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /inventory/adjust — should adjust stock', async () => {
      if (!variantId || !warehouseId) return;
      const res = await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ variantId, warehouseId, delta: -5, reason: 'damage' });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /inventory/reserve — should reserve stock', async () => {
      if (!variantId || !warehouseId) return;
      const res = await request(app.getHttpServer())
        .post('/inventory/reserve')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ variantId, warehouseId, quantity: 3 });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('GET /inventory — should list inventory', async () => {
      await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /inventory/low-stock — should list low stock', async () => {
      await request(app.getHttpServer())
        .get('/inventory/low-stock')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SHIPPING
  // ═══════════════════════════════════════════════════════════════════════

  describe('Shipping', () => {
    // Zones
    it('POST /shipping/zones — should create zone', async () => {
      const res = await request(app.getHttpServer())
        .post('/shipping/zones')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Admin Zone ' + Date.now(), isActive: true });
      expect([200, 201]).toContain(res.status);
      zoneId = extractId(res);
    });

    it('GET /shipping/zones — should list zones', async () => {
      await request(app.getHttpServer())
        .get('/shipping/zones')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /shipping/zones/:id — should get zone', async () => {
      if (!zoneId) return;
      await request(app.getHttpServer())
        .get(`/shipping/zones/${zoneId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /shipping/zones/:id — should update zone', async () => {
      if (!zoneId) return;
      await request(app.getHttpServer())
        .put(`/shipping/zones/${zoneId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Updated Zone' })
        .expect(200);
    });

    // Zone Countries
    it('POST /shipping/zones/:zoneId/countries — should add country', async () => {
      if (!zoneId) return;
      const res = await request(app.getHttpServer())
        .post(`/shipping/zones/${zoneId}/countries`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ country: 'PK' });
      expect([200, 201, 409]).toContain(res.status);
    });

    it('GET /shipping/zones/:zoneId/countries — should list countries', async () => {
      if (!zoneId) return;
      await request(app.getHttpServer())
        .get(`/shipping/zones/${zoneId}/countries`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    // Methods
    it('POST /shipping/methods — should create method', async () => {
      if (!zoneId) return;
      const res = await request(app.getHttpServer())
        .post('/shipping/methods')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ zoneId, name: 'Express ' + Date.now(), carrier: 'TCS', baseRate: 300, perKgRate: 50, estimatedDaysMin: 1, estimatedDaysMax: 3 });
      expect([200, 201]).toContain(res.status);
      shippingMethodId = extractId(res);
    });

    it('GET /shipping/methods — should list methods', async () => {
      await request(app.getHttpServer())
        .get('/shipping/methods')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /shipping/methods/:id — should update method', async () => {
      if (!shippingMethodId) return;
      await request(app.getHttpServer())
        .put(`/shipping/methods/${shippingMethodId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ baseRate: 350 })
        .expect(200);
    });

    // Shipments
    it('POST /shipping/shipments — should create shipment', async () => {
      if (!shippingMethodId) return;
      const res = await request(app.getHttpServer())
        .post('/shipping/shipments')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ orderId: '00000000-0000-0000-0000-000000000001', methodId: shippingMethodId, trackingNumber: 'ADMIN-' + Date.now() });
      expect([200, 201, 400, 404]).toContain(res.status);
    });

    it('GET /shipping/shipments/:id — should get shipment (or 404)', async () => {
      await request(app.getHttpServer())
        .get('/shipping/shipments/00000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect((r) => expect([200, 404]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // COUPONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Coupons', () => {
    it('POST /coupons — should create coupon', async () => {
      const res = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ code: uniqueCode('CPN'), discountType: 'percentage', discountValue: 15 });
      expect([200, 201]).toContain(res.status);
      couponId = extractId(res);
    });

    it('GET /coupons — should list coupons', async () => {
      await request(app.getHttpServer())
        .get('/coupons')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /coupons/:id — should get coupon', async () => {
      if (!couponId) return;
      await request(app.getHttpServer())
        .get(`/coupons/${couponId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /coupons/:id — should update coupon', async () => {
      if (!couponId) return;
      await request(app.getHttpServer())
        .put(`/coupons/${couponId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ discountValue: 20 })
        .expect(200);
    });

    it('POST /coupons/:id/scopes — should add scope', async () => {
      if (!couponId) return;
      const res = await request(app.getHttpServer())
        .post(`/coupons/${couponId}/scopes`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ scopeType: 'category', scopeId: '00000000-0000-0000-0000-000000000001' });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('GET /coupons/:id/scopes — should list scopes', async () => {
      if (!couponId) return;
      await request(app.getHttpServer())
        .get(`/coupons/${couponId}/scopes`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // FLASH SALES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Flash Sales', () => {
    it('POST /flash-sales — should create flash sale', async () => {
      const res = await request(app.getHttpServer())
        .post('/flash-sales')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Admin Sale ' + Date.now(), startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 86400000).toISOString() });
      expect([200, 201]).toContain(res.status);
      flashSaleId = extractId(res);
    });

    it('GET /flash-sales — should list', async () => {
      await request(app.getHttpServer())
        .get('/flash-sales')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /flash-sales/:id — should get', async () => {
      if (!flashSaleId) return;
      await request(app.getHttpServer())
        .get(`/flash-sales/${flashSaleId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /flash-sales/:id — should update', async () => {
      if (!flashSaleId) return;
      await request(app.getHttpServer())
        .put(`/flash-sales/${flashSaleId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Updated Sale' })
        .expect(200);
    });

    it('POST /flash-sales/:id/items — should add item', async () => {
      if (!flashSaleId || !variantId) return;
      const res = await request(app.getHttpServer())
        .post(`/flash-sales/${flashSaleId}/items`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ variantId, salePrice: 399, stock: 20 });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /flash-sales/:id/items — should list items', async () => {
      if (!flashSaleId) return;
      await request(app.getHttpServer())
        .get(`/flash-sales/${flashSaleId}/items`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Orders', () => {
    it('GET /orders — should list all orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
      const data = extractData(res);
      if (Array.isArray(data) && data.length > 0) orderId = data[0].id;
    });

    it('GET /orders/:id — should get order', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /orders/:id/items — should get items', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .get(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /orders/:id/status — should update order status', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ status: 'processing' })
        .expect((r) => expect([200, 400]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Payments', () => {
    it('GET /payments — should list payments', async () => {
      await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /payments/:id/status — should update payment status', async () => {
      await request(app.getHttpServer())
        .put('/payments/00000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ status: 'completed' })
        .expect((r) => expect([200, 404]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RETURNS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Returns', () => {
    it('GET /returns — should list', async () => {
      await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /returns/:id/status — should update return status', async () => {
      // get first return if any
      const listRes = await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${admin.token}`);
      const returns = extractData(listRes);
      if (Array.isArray(returns) && returns.length > 0) {
        returnId = returns[0].id;
        await request(app.getHttpServer())
          .put(`/returns/${returnId}/status`)
          .set('Authorization', `Bearer ${admin.token}`)
          .send({ status: 'approved' })
          .expect((r) => expect([200, 400]).toContain(r.status));
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // REVIEWS (ADMIN CAN MODERATE)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Reviews', () => {
    it('GET /reviews — should list', async () => {
      const res = await request(app.getHttpServer()).get('/reviews').expect(200);
      const data = extractData(res);
      if (Array.isArray(data) && data.length > 0) reviewId = data[0].id;
    });

    it('PUT /reviews/:id — should moderate review', async () => {
      if (!reviewId) return;
      await request(app.getHttpServer())
        .put(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ status: 'approved' })
        .expect((r) => expect([200, 400]).toContain(r.status));
    });

    it('DELETE /reviews/:id — should delete review', async () => {
      if (!reviewId) return;
      await request(app.getHttpServer())
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS PLANS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Subscription Plans', () => {
    it('POST /subscriptions/plans — should create plan', async () => {
      const res = await request(app.getHttpServer())
        .post('/subscriptions/plans')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Admin Plan ' + Date.now(), price: 199, currency: 'PKR', interval: 'monthly', intervalCount: 1 });
      expect([200, 201]).toContain(res.status);
      planId = extractId(res);
    });

    it('GET /subscriptions/plans — should list', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /subscriptions/plans/:id — should update plan', async () => {
      if (!planId) return;
      await request(app.getHttpServer())
        .put(`/subscriptions/plans/${planId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ price: 249 })
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Notifications', () => {
    it('POST /notifications — should create notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ userId: admin.userId, channel: 'push', type: 'order_update', title: 'Admin Notice', body: 'Test notification' });
      expect([200, 201]).toContain(res.status);
      notificationId = extractId(res);
    });

    it('GET /notifications/mine — should list', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /notifications/mine/unread-count — should get count', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine/unread-count')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /notifications/:id/read — should mark read', async () => {
      if (!notificationId) return;
      await request(app.getHttpServer())
        .put(`/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('PUT /notifications/mine/read-all — should mark all read', async () => {
      await request(app.getHttpServer())
        .put('/notifications/mine/read-all')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CHAT
  // ═══════════════════════════════════════════════════════════════════════

  describe('Chat', () => {
    it('POST /chat/threads — should create thread', async () => {
      const res = await request(app.getHttpServer())
        .post('/chat/threads')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ subject: 'Admin Thread' });
      expect([200, 201]).toContain(res.status);
      threadId = extractId(res);
    });

    it('POST /chat/messages — should send message', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .post('/chat/messages')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ threadId, body: 'Admin message' })
        .expect((r) => expect([200, 201]).toContain(r.status));
    });

    it('GET /chat/mine/threads — should list threads', async () => {
      await request(app.getHttpServer())
        .get('/chat/mine/threads')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /chat/threads/:id/messages — should get messages', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}/messages`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════════════

  describe('Search', () => {
    it('GET /search/products — should search', async () => {
      await request(app.getHttpServer())
        .get('/search/products')
        .set('Authorization', `Bearer ${admin.token}`)
        .query({ q: 'test' })
        .expect(200);
    });

    it('GET /search/popular — should get popular', async () => {
      await request(app.getHttpServer())
        .get('/search/popular')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Audit Logs', () => {
    it('POST /audit-logs — should create log', async () => {
      const res = await request(app.getHttpServer())
        .post('/audit-logs')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ action: 'TEST', tableName: 'test' });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('GET /audit-logs — should list logs', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('GET /audit-logs/entity/:type/:id — should get by entity', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs/entity/test/123')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect((r) => expect([200, 400]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SELLERS & STORES (ADMIN CAN MANAGE)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Sellers & Stores', () => {
    it('GET /sellers — should list', async () => {
      await request(app.getHttpServer()).get('/sellers').expect(200);
    });

    it('GET /stores — should list', async () => {
      await request(app.getHttpServer()).get('/stores').expect(200);
    });
  });
});
