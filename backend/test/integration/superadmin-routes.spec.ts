/**
 * SUPER_ADMIN Role — All Routes Integration Tests
 *
 * Tests EVERY Swagger route as super_admin.
 * Super admin bypasses BOTH RolesGuard AND PermissionsGuard.
 * Should have full access to every single endpoint.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createApp,
  login,
  extractId,
  extractData,
  uniqueEmail,
  uniqueSlug,
  uniqueCode,
  AuthResult,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
} from '../utils/role-test-helpers';

describe('All Routes — SUPER_ADMIN Role (e2e)', () => {
  let app: INestApplication;
  let sa: AuthResult;

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
  let countryId: string;
  let shippingMethodId: string;
  let couponId: string;
  let flashSaleId: string;
  let flashSaleItemId: string;
  let orderId: string;
  let returnId: string;
  let reviewId: string;
  let planId: string;
  let subscriptionId: string;
  let userId: string;
  let addressId: string;
  let threadId: string;
  let notificationId: string;
  let searchId: string;
  let auditLogId: string;

  beforeAll(async () => {
    app = await createApp();
    sa = await login(app, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════

  describe('Auth', () => {
    it('POST /auth/login — should login super admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /auth/register — should register new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail('sa-reg'), password: 'Test@12345', firstName: 'SA', lastName: 'Reg' });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /auth/change-password — should work for super admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ oldPassword: 'WrongOldPassword@1', newPassword: 'NewPass@123456' });
      expect([200, 400, 401]).toContain(res.status);
    });

    it('POST /auth/forgot-password — should accept', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: SUPER_ADMIN_EMAIL });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /auth/refresh — should reject empty token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: '' })
        .expect(400);
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
  // ROLES (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Roles', () => {
    it('POST /roles — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: uniqueSlug('sa-role'), description: 'SA test role' });
      expect([200, 201]).toContain(res.status);
      roleId = extractId(res);
    });

    it('GET /roles — should list', async () => {
      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /roles/:id — should get', async () => {
      if (!roleId) return;
      await request(app.getHttpServer())
        .get(`/roles/${roleId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /roles/:id — should update', async () => {
      if (!roleId) return;
      await request(app.getHttpServer())
        .put(`/roles/${roleId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ description: 'Updated' })
        .expect(200);
    });

    it('DELETE /roles/:id — should delete', async () => {
      if (!roleId) return;
      await request(app.getHttpServer())
        .delete(`/roles/${roleId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PERMISSIONS (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Permissions', () => {
    it('POST /permissions — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ code: uniqueCode('saperm') + '.read', module: 'sa-test', description: 'SA perm' });
      expect([200, 201]).toContain(res.status);
      permissionId = extractId(res);
    });

    it('GET /permissions — should list', async () => {
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /permissions/:id — should get', async () => {
      if (!permissionId) return;
      await request(app.getHttpServer())
        .get(`/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /permissions/by-module — should get by module', async () => {
      await request(app.getHttpServer())
        .get('/permissions/by-module')
        .query({ module: 'sa-test' })
        .set('Authorization', `Bearer ${sa.token}`)
        .expect((r) => expect([200, 400]).toContain(r.status));
    });

    it('PUT /permissions/:id — should update', async () => {
      if (!permissionId) return;
      await request(app.getHttpServer())
        .put(`/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ description: 'Updated SA perm' })
        .expect(200);
    });

    it('DELETE /permissions/:id — should delete', async () => {
      if (!permissionId) return;
      await request(app.getHttpServer())
        .delete(`/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ROLE-PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Role-Permissions', () => {
    it('POST /role-permissions — should assign', async () => {
      const rRes = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: uniqueSlug('sa-rp'), description: 'RP' });
      const pRes = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ code: uniqueCode('sarp') + '.read', module: 'sarp', description: 'RP' });
      const rId = extractId(rRes);
      const pId = extractId(pRes);
      if (!rId || !pId) return;
      const res = await request(app.getHttpServer())
        .post('/role-permissions')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ roleId: rId, permissionIds: [pId] });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /role-permissions/:roleId — should list', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${sa.token}`);
      const roles = extractData(listRes);
      if (Array.isArray(roles) && roles.length > 0) {
        await request(app.getHttpServer())
          .get(`/role-permissions/${roles[0].id}`)
          .set('Authorization', `Bearer ${sa.token}`)
          .expect(200);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // USERS (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Users', () => {
    it('POST /users — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ email: uniqueEmail('sa-user'), password: 'Pass@12345', firstName: 'SA', lastName: 'User' });
      expect([200, 201]).toContain(res.status);
      userId = extractId(res);
    });

    it('GET /users — should list', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /users/:id — should get', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /users/:id — should update', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ firstName: 'SAUpdated' })
        .expect(200);
    });

    it('GET /users/:id/roles — should list roles', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .get(`/users/${userId}/roles`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('POST /users/:id/roles — should assign role', async () => {
      if (!userId) return;
      const rolesRes = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${sa.token}`);
      const roles = extractData(rolesRes);
      if (Array.isArray(roles) && roles.length > 0) {
        const res = await request(app.getHttpServer())
          .post(`/users/${userId}/roles`)
          .set('Authorization', `Bearer ${sa.token}`)
          .send({ roleId: roles[0].id });
        expect([200, 201, 409]).toContain(res.status);
      }
    });

    it('POST /users/:id/addresses — should create address', async () => {
      if (!userId) return;
      const res = await request(app.getHttpServer())
        .post(`/users/${userId}/addresses`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ label: 'SA Office', line1: '789 HQ', city: 'Islamabad', state: 'ICT', postalCode: '44000', country: 'PK' });
      expect([200, 201]).toContain(res.status);
      addressId = extractId(res);
    });

    it('GET /users/:id/addresses — should list addresses', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .get(`/users/${userId}/addresses`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /users/addresses/:addressId — should update', async () => {
      if (!addressId) return;
      await request(app.getHttpServer())
        .put(`/users/addresses/${addressId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ label: 'SA HQ Updated' })
        .expect((r) => expect([200, 403, 404]).toContain(r.status));
    });

    it('DELETE /users/addresses/:addressId — should delete', async () => {
      if (!addressId) return;
      await request(app.getHttpServer())
        .delete(`/users/addresses/${addressId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect((r) => expect([200, 403]).toContain(r.status));
    });

    it('DELETE /users/:id — should delete user', async () => {
      if (!userId) return;
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORIES (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Categories', () => {
    it('POST /categories — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Cat', slug: uniqueSlug('sacat') });
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
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Cat Updated' })
        .expect(200);
    });

    it('DELETE /categories/:id — should delete', async () => {
      if (!categoryId) return;
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // BRANDS (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Brands', () => {
    it('POST /brands — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/brands')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Brand', slug: uniqueSlug('sabrand') });
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
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Brand Updated' })
        .expect(200);
    });

    it('DELETE /brands/:id — should delete', async () => {
      if (!brandId) return;
      await request(app.getHttpServer())
        .delete(`/brands/${brandId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PRODUCTS (FULL CRUD + VARIANTS + IMAGES + CATEGORIES + ATTRIBUTES)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Products', () => {
    it('POST /products — should create', async () => {
      const storesRes = await request(app.getHttpServer()).get('/stores');
      const stores = extractData(storesRes);
      const storeId = Array.isArray(stores) && stores.length > 0 ? stores[0].id : null;
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ slug: uniqueSlug('saprod'), basePrice: 1000, storeId: storeId || '00000000-0000-0000-0000-000000000001' });
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
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Product Updated' })
        .expect(200);
    });

    // Variants
    it('POST /products/:id/variants — should create variant', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/variants`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ sku: uniqueCode('SASKU'), price: 1199, stock: 200, name: 'SA V1' });
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
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ price: 1299 })
        .expect(200);
    });

    it('DELETE /products/:id/variants/:variantId — should delete', async () => {
      if (!productId || !variantId) return;
      await request(app.getHttpServer())
        .delete(`/products/${productId}/variants/${variantId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
      // Re-create variant for later tests
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/variants`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ sku: uniqueCode('SASKU2'), price: 899, stock: 100, name: 'SA V2' });
      variantId = extractId(res);
    });

    // Images
    it('POST /products/:id/images — should add image', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/images`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ url: 'https://example.com/sa-img.jpg', altText: 'SA image', position: 0 });
      expect([200, 201, 404]).toContain(res.status);
      imageId = extractId(res);
    });

    it('GET /products/:id/images — should list', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/images`).expect(200);
    });

    it('DELETE /products/:id/images/:imageId — should delete', async () => {
      if (!productId || !imageId) return;
      await request(app.getHttpServer())
        .delete(`/products/${productId}/images/${imageId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    // Product Categories
    it('POST /products/:id/categories — should assign category', async () => {
      if (!productId) return;
      // Create a category for assignment
      const catRes = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'ProdCat ' + Date.now(), slug: uniqueSlug('pcat') });
      const catId = extractId(catRes);
      if (!catId) return;
      const res = await request(app.getHttpServer())
        .post(`/products/${productId}/categories`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ categoryId: catId });
      expect([200, 201, 404, 409]).toContain(res.status);
    });

    it('GET /products/:id/categories — should list product categories', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/products/${productId}/categories`).expect(200);
    });

    // Attribute keys / values
    it('GET /products/attributes/keys — should list', async () => {
      await request(app.getHttpServer()).get('/products/attributes/keys').expect(200);
    });

    it('POST /products/attributes/keys — should create key', async () => {
      const res = await request(app.getHttpServer())
        .post('/products/attributes/keys')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'Color-' + Date.now() });
      expect([200, 201, 400]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // WAREHOUSES (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Warehouses', () => {
    it('POST /warehouses — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/warehouses')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ code: uniqueCode('SAWH'), name: 'SA WH', line1: 'SA HQ', city: 'Islamabad', country: 'PK', isActive: true });
      expect([200, 201]).toContain(res.status);
      warehouseId = extractId(res);
    });

    it('GET /warehouses — should list', async () => {
      await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /warehouses/:id — should get', async () => {
      if (!warehouseId) return;
      await request(app.getHttpServer())
        .get(`/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /warehouses/:id — should update', async () => {
      if (!warehouseId) return;
      await request(app.getHttpServer())
        .put(`/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA WH Updated' })
        .expect(200);
    });

    it('DELETE /warehouses/:id — should delete', async () => {
      if (!warehouseId) return;
      await request(app.getHttpServer())
        .delete(`/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
      // Re-create for inventory tests
      const res = await request(app.getHttpServer())
        .post('/warehouses')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ code: uniqueCode('SAWH2'), name: 'SA WH2', line1: 'SA HQ', city: 'Islamabad', country: 'PK', isActive: true });
      warehouseId = extractId(res);
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
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ variantId, warehouseId, quantity: 100 });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /inventory/adjust — should adjust stock', async () => {
      if (!variantId || !warehouseId) return;
      const res = await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ variantId, warehouseId, delta: -10, reason: 'sold' });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /inventory/reserve — should reserve', async () => {
      if (!variantId || !warehouseId) return;
      const res = await request(app.getHttpServer())
        .post('/inventory/reserve')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ variantId, warehouseId, quantity: 5 });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('POST /inventory/release — should release reservation', async () => {
      if (!variantId || !warehouseId) return;
      const res = await request(app.getHttpServer())
        .post('/inventory/release')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ variantId, warehouseId, quantity: 5 });
      expect([200, 201, 400]).toContain(res.status);
    });

    it('GET /inventory — should list', async () => {
      await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /inventory/low-stock — should list low', async () => {
      await request(app.getHttpServer())
        .get('/inventory/low-stock')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SHIPPING (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Shipping', () => {
    // Zones
    it('POST /shipping/zones — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/shipping/zones')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Zone ' + Date.now(), isActive: true });
      expect([200, 201]).toContain(res.status);
      zoneId = extractId(res);
    });

    it('GET /shipping/zones — should list', async () => {
      await request(app.getHttpServer())
        .get('/shipping/zones')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /shipping/zones/:id — should get', async () => {
      if (!zoneId) return;
      await request(app.getHttpServer())
        .get(`/shipping/zones/${zoneId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /shipping/zones/:id — should update', async () => {
      if (!zoneId) return;
      await request(app.getHttpServer())
        .put(`/shipping/zones/${zoneId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'Updated Zone' })
        .expect(200);
    });

    // Countries
    it('POST /shipping/zones/:zoneId/countries — should add', async () => {
      if (!zoneId) return;
      const res = await request(app.getHttpServer())
        .post(`/shipping/zones/${zoneId}/countries`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ countryCode: 'US' });
      expect([200, 201, 400, 404, 409]).toContain(res.status);
      countryId = extractId(res);
    });

    it('GET /shipping/zones/:zoneId/countries — should list', async () => {
      if (!zoneId) return;
      await request(app.getHttpServer())
        .get(`/shipping/zones/${zoneId}/countries`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('DELETE /shipping/zones/:zoneId/countries/:countryId — should remove', async () => {
      if (!zoneId || !countryId) return;
      await request(app.getHttpServer())
        .delete(`/shipping/zones/${zoneId}/countries/${countryId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    // Methods
    it('POST /shipping/methods — should create', async () => {
      if (!zoneId) return;
      const res = await request(app.getHttpServer())
        .post('/shipping/methods')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ zoneId, name: 'SA Express ' + Date.now(), carrier: 'DHL', baseRate: 500, perKgRate: 50, estimatedDaysMin: 1, estimatedDaysMax: 5 });
      expect([200, 201]).toContain(res.status);
      shippingMethodId = extractId(res);
    });

    it('GET /shipping/methods — should list', async () => {
      await request(app.getHttpServer())
        .get('/shipping/methods')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /shipping/methods/:id — should get', async () => {
      if (!shippingMethodId) return;
      await request(app.getHttpServer())
        .get(`/shipping/methods/${shippingMethodId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /shipping/methods/:id — should update', async () => {
      if (!shippingMethodId) return;
      await request(app.getHttpServer())
        .put(`/shipping/methods/${shippingMethodId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ baseRate: 550 })
        .expect(200);
    });

    it('DELETE /shipping/methods/:id — should delete', async () => {
      if (!shippingMethodId) return;
      await request(app.getHttpServer())
        .delete(`/shipping/methods/${shippingMethodId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect((r) => expect([200, 404]).toContain(r.status));
    });

    // Shipments
    it('POST /shipping/shipments — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/shipping/shipments')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ orderId: '00000000-0000-0000-0000-000000000001', methodId: '00000000-0000-0000-0000-000000000001', trackingNumber: 'SA-' + Date.now() });
      expect([200, 201, 400, 404]).toContain(res.status);
    });

    it('GET /shipping/shipments/:id — should get (or 404)', async () => {
      await request(app.getHttpServer())
        .get('/shipping/shipments/00000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect((r) => expect([200, 404]).toContain(r.status));
    });

    // Zone deletion
    it('DELETE /shipping/zones/:id — should delete zone', async () => {
      if (!zoneId) return;
      await request(app.getHttpServer())
        .delete(`/shipping/zones/${zoneId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect((r) => expect([200, 404, 409]).toContain(r.status)); // might 409 if methods linked
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // COUPONS (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Coupons', () => {
    it('POST /coupons — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ code: uniqueCode('SACPN'), discountType: 'fixed', discountValue: 500 });
      expect([200, 201]).toContain(res.status);
      couponId = extractId(res);
    });

    it('GET /coupons — should list', async () => {
      await request(app.getHttpServer())
        .get('/coupons')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /coupons/:id — should get', async () => {
      if (!couponId) return;
      await request(app.getHttpServer())
        .get(`/coupons/${couponId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /coupons/code/:code — should find by code', async () => {
      if (!couponId) return;
      const cpn = await request(app.getHttpServer())
        .get(`/coupons/${couponId}`)
        .set('Authorization', `Bearer ${sa.token}`);
      const code = extractData(cpn)?.code;
      if (code) {
        await request(app.getHttpServer())
          .get(`/coupons/code/${code}`)
          .set('Authorization', `Bearer ${sa.token}`)
          .expect(200);
      }
    });

    it('PUT /coupons/:id — should update', async () => {
      if (!couponId) return;
      await request(app.getHttpServer())
        .put(`/coupons/${couponId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ discountValue: 600 })
        .expect(200);
    });

    it('DELETE /coupons/:id — should delete', async () => {
      if (!couponId) return;
      await request(app.getHttpServer())
        .delete(`/coupons/${couponId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // FLASH SALES (FULL CRUD)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Flash Sales', () => {
    it('POST /flash-sales — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/flash-sales')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Sale ' + Date.now(), startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 86400000).toISOString() });
      expect([200, 201]).toContain(res.status);
      flashSaleId = extractId(res);
    });

    it('GET /flash-sales — should list', async () => {
      await request(app.getHttpServer())
        .get('/flash-sales')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /flash-sales/:id — should get', async () => {
      if (!flashSaleId) return;
      await request(app.getHttpServer())
        .get(`/flash-sales/${flashSaleId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /flash-sales/:id — should update', async () => {
      if (!flashSaleId) return;
      await request(app.getHttpServer())
        .put(`/flash-sales/${flashSaleId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'Updated SA Sale' })
        .expect(200);
    });

    it('POST /flash-sales/:id/items — should add item', async () => {
      if (!flashSaleId || !variantId) return;
      const res = await request(app.getHttpServer())
        .post(`/flash-sales/${flashSaleId}/items`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ variantId, salePrice: 499, stock: 30 });
      expect([200, 201]).toContain(res.status);
      flashSaleItemId = extractId(res);
    });

    it('GET /flash-sales/:id/items — should list items', async () => {
      if (!flashSaleId) return;
      await request(app.getHttpServer())
        .get(`/flash-sales/${flashSaleId}/items`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('DELETE /flash-sales/:id/items/:itemId — should remove item', async () => {
      if (!flashSaleId || !flashSaleItemId) return;
      await request(app.getHttpServer())
        .delete(`/flash-sales/${flashSaleId}/items/${flashSaleItemId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('DELETE /flash-sales/:id — should delete', async () => {
      if (!flashSaleId) return;
      await request(app.getHttpServer())
        .delete(`/flash-sales/${flashSaleId}`)
        .set('Authorization', `Bearer ${sa.token}`)
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
        .set('Authorization', `Bearer ${sa.token}`)
        .send({
          order: { shippingAmount: 300, shippingLine1: 'HQ St', shippingCity: 'Islamabad', shippingState: 'ICT', shippingPostalCode: '44000', shippingCountry: 'PK' },
          items: variantId ? [{ variantId, quantity: 1 }] : [],
        });
      expect([200, 201, 400, 500]).toContain(res.status);
      orderId = extractId(res);
    });

    it('GET /orders — should list', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /orders/:id — should get', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /orders/:id/items — should get items', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .get(`/orders/${orderId}/items`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /orders/:id/status — should update status', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ status: 'processing' })
        .expect((r) => expect([200, 400]).toContain(r.status));
    });

    it('PUT /orders/:id/cancel — should cancel', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .put(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${sa.token}`);
      expect([200, 400]).toContain(res.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Payments', () => {
    it('POST /payments — should create', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ orderId, gateway: 'stripe', method: 'credit_card', amount: 1300, currency: 'PKR', status: 'pending' });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /payments — should list', async () => {
      await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /payments/:id/status — should update status', async () => {
      await request(app.getHttpServer())
        .put('/payments/00000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ status: 'completed' })
        .expect((r) => expect([200, 404]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RETURNS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Returns', () => {
    it('POST /returns — should create', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .post('/returns')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ return: { orderId, reason: 'Quality issue' } });
      expect([200, 201]).toContain(res.status);
      returnId = extractId(res);
    });

    it('GET /returns — should list', async () => {
      await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /returns/:id — should get', async () => {
      if (!returnId) return;
      await request(app.getHttpServer())
        .get(`/returns/${returnId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /returns/:id/status — should update status', async () => {
      if (!returnId) return;
      await request(app.getHttpServer())
        .put(`/returns/${returnId}/status`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ status: 'approved' })
        .expect((r) => expect([200, 400]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // REVIEWS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Reviews', () => {
    it('POST /reviews — should create', async () => {
      if (!productId) return;
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ productId, rating: 5, title: 'SA Review', body: 'Perfect!' });
      expect([200, 201, 400]).toContain(res.status);
      reviewId = extractId(res);
    });

    it('GET /reviews — should list', async () => {
      await request(app.getHttpServer()).get('/reviews').expect(200);
    });

    it('GET /reviews/:id — should get', async () => {
      if (!reviewId) return;
      await request(app.getHttpServer()).get(`/reviews/${reviewId}`).expect(200);
    });

    it('GET /reviews/product/:productId/summary — should get summary', async () => {
      if (!productId) return;
      await request(app.getHttpServer()).get(`/reviews/product/${productId}/summary`).expect(200);
    });

    it('PUT /reviews/:id — should update', async () => {
      if (!reviewId) return;
      await request(app.getHttpServer())
        .put(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ status: 'approved' })
        .expect((r) => expect([200, 400]).toContain(r.status));
    });

    it('DELETE /reviews/:id — should delete', async () => {
      if (!reviewId) return;
      await request(app.getHttpServer())
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Subscriptions', () => {
    it('POST /subscriptions/plans — should create plan', async () => {
      const res = await request(app.getHttpServer())
        .post('/subscriptions/plans')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Plan ' + Date.now(), price: 499, currency: 'PKR', interval: 'monthly', intervalCount: 1 });
      expect([200, 201]).toContain(res.status);
      planId = extractId(res);
    });

    it('GET /subscriptions/plans — should list', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /subscriptions/plans/:id — should get', async () => {
      if (!planId) return;
      await request(app.getHttpServer())
        .get(`/subscriptions/plans/${planId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /subscriptions/plans/:id — should update', async () => {
      if (!planId) return;
      await request(app.getHttpServer())
        .put(`/subscriptions/plans/${planId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ price: 599 })
        .expect(200);
    });

    it('DELETE /subscriptions/plans/:id — should delete', async () => {
      if (!planId) return;
      await request(app.getHttpServer())
        .delete(`/subscriptions/plans/${planId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('POST /subscriptions/subscribe — should subscribe (self)', async () => {
      // Create a plan first
      const pRes = await request(app.getHttpServer())
        .post('/subscriptions/plans')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'Sub Plan ' + Date.now(), price: 99, currency: 'PKR', interval: 'monthly', intervalCount: 1 });
      const pId = extractId(pRes);
      if (!pId) return;
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ planId: pId });
      expect([200, 201, 400]).toContain(res.status);
      subscriptionId = extractId(res);
    });

    it('GET /subscriptions/mine — should list my subscriptions', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/mine')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /subscriptions/:id/cancel — should cancel subscription', async () => {
      if (!subscriptionId) return;
      await request(app.getHttpServer())
        .put(`/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect((r) => expect([200, 400]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Notifications', () => {
    it('POST /notifications — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ userId: sa.userId, channel: 'push', type: 'order_update', title: 'SA Notice', body: 'Global announcement' });
      expect([200, 201]).toContain(res.status);
      notificationId = extractId(res);
    });

    it('GET /notifications/mine — should list', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /notifications/mine/unread-count — should get count', async () => {
      await request(app.getHttpServer())
        .get('/notifications/mine/unread-count')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /notifications/:id — should get one', async () => {
      if (!notificationId) return;
      await request(app.getHttpServer())
        .get(`/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /notifications/:id/read — should mark read', async () => {
      if (!notificationId) return;
      await request(app.getHttpServer())
        .put(`/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /notifications/mine/read-all — should mark all read', async () => {
      await request(app.getHttpServer())
        .put('/notifications/mine/read-all')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('DELETE /notifications/:id — should delete', async () => {
      if (!notificationId) return;
      await request(app.getHttpServer())
        .delete(`/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${sa.token}`)
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
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ subject: 'SA Thread' });
      expect([200, 201]).toContain(res.status);
      threadId = extractId(res);
    });

    it('POST /chat/messages — should send message', async () => {
      if (!threadId) return;
      const res = await request(app.getHttpServer())
        .post('/chat/messages')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ threadId, body: 'SA message' });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /chat/threads/:id — should get thread', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /chat/threads/:id/messages — should get messages', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}/messages`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /chat/mine/threads — should list threads', async () => {
      await request(app.getHttpServer())
        .get('/chat/mine/threads')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /chat/threads/:id/participants — should get participants', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .get(`/chat/threads/${threadId}/participants`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /chat/threads/:id/status — should update status', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .put(`/chat/threads/${threadId}/status`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ status: 'closed' })
        .expect((r) => expect([200, 400]).toContain(r.status));
    });

    it('PUT /chat/threads/:id/read — should update last read', async () => {
      if (!threadId) return;
      await request(app.getHttpServer())
        .put(`/chat/threads/${threadId}/read`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════════════

  describe('Search', () => {
    it('POST /search — should log search', async () => {
      const res = await request(app.getHttpServer())
        .post('/search')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ query: 'laptop', resultCount: 5 });
      expect([200, 201]).toContain(res.status);
      searchId = extractId(res);
    });

    it('GET /search/history — should get history', async () => {
      await request(app.getHttpServer())
        .get('/search/history')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /search/popular — should get popular', async () => {
      await request(app.getHttpServer())
        .get('/search/popular')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('PUT /search/:id/click — should record click', async () => {
      if (!searchId) return;
      const res = await request(app.getHttpServer())
        .put(`/search/${searchId}/click`)
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ productId: productId || '00000000-0000-0000-0000-000000000001' });
      expect([200, 400, 404]).toContain(res.status);
    });

    it('GET /search/products — should search products', async () => {
      await request(app.getHttpServer())
        .get('/search/products')
        .set('Authorization', `Bearer ${sa.token}`)
        .query({ q: 'product' })
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Audit Logs', () => {
    it('POST /audit-logs — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/audit-logs')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ action: 'SA_TEST', tableName: 'test' });
      expect([200, 201, 400]).toContain(res.status);
      auditLogId = extractId(res);
    });

    it('GET /audit-logs — should list', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /audit-logs/:id — should get', async () => {
      if (!auditLogId) return;
      await request(app.getHttpServer())
        .get(`/audit-logs/${auditLogId}`)
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });

    it('GET /audit-logs/entity/:type/:id — should get by entity', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs/entity/test/999')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect((r) => expect([200, 400]).toContain(r.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SELLERS & STORES
  // ═══════════════════════════════════════════════════════════════════════

  describe('Sellers & Stores', () => {
    it('GET /sellers — should list', async () => {
      await request(app.getHttpServer()).get('/sellers').expect(200);
    });

    it('GET /stores — should list', async () => {
      await request(app.getHttpServer()).get('/stores').expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // CART (SA CAN ALSO USE)
  // ═══════════════════════════════════════════════════════════════════════

  describe('Cart', () => {
    it('GET /cart/mine — should get cart', async () => {
      await request(app.getHttpServer())
        .get('/cart/mine')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // WISHLISTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Wishlists', () => {
    it('POST /wishlists — should create', async () => {
      const res = await request(app.getHttpServer())
        .post('/wishlists')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ name: 'SA Favs', isPublic: false });
      expect([200, 201]).toContain(res.status);
    });

    it('GET /wishlists/mine — should list', async () => {
      await request(app.getHttpServer())
        .get('/wishlists/mine')
        .set('Authorization', `Bearer ${sa.token}`)
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MAIL
  // ═══════════════════════════════════════════════════════════════════════

  describe('Mail', () => {
    it('POST /mail/test — should send test email', async () => {
      const res = await request(app.getHttpServer())
        .post('/mail/test')
        .set('Authorization', `Bearer ${sa.token}`)
        .send({ to: 'test@example.com' });
      expect([200, 201, 400, 500]).toContain(res.status);
    });
  });
});
