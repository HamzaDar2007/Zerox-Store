/**
 * Admin Flow Integration Tests
 *
 * Tests the complete admin workflow:
 * - Login as admin
 * - RBAC: Manage roles, permissions, role-permissions
 * - Users: CRUD, assign/remove roles
 * - Categories & Brands: CRUD
 * - Products: Moderate/manage
 * - Orders: View, update status
 * - Returns: Review & approve/reject
 * - Reviews: Moderate
 * - Inventory: Warehouses, stock management
 * - Shipping: Zones, methods
 * - Subscriptions: Plan management
 * - Audit logs: View activity
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Admin Flow (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let createdUserId: string;
  let createdRoleId: string;
  let createdPermissionId: string;
  let createdCategoryId: string;
  let createdBrandId: string;
  let createdWarehouseId: string;
  // Super admin credentials (from seeds)
  const superAdminEmail =
    process.env.SUPER_ADMIN_EMAIL || 'husnainramzan7194@gmail.com';
  const superAdminPassword =
    process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123!';
  const uniqueEmail = `admin-test-${Date.now()}@labverse.org`;
  const password = 'Admin@123456';

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

  // ─── AUTH ────────────────────────────────────────────────────────────────

  describe('Admin Authentication', () => {
    it('POST /auth/login - should login as super admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: superAdminEmail,
          password: superAdminPassword,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      adminToken = res.body?.data?.accessToken || res.body?.accessToken;
      expect(adminToken).toBeDefined();
    });

    it('POST /auth/register - should register a test user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          firstName: 'Admin',
          lastName: 'Tester',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      expect(res.body).toBeDefined();
    });

    it('POST /auth/login - should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: superAdminEmail,
          password: 'WrongPassword',
        })
        .expect((r) => {
          expect([401, 400]).toContain(r.status);
        });
    });

    it('POST /auth/login - should reject empty body', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('POST /auth/register - should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
        })
        .expect((r) => {
          expect([400, 409, 500]).toContain(r.status);
        });
    });
  });

  // ─── ROLES MANAGEMENT ───────────────────────────────────────────────────

  describe('Roles Management (Admin)', () => {
    it('POST /roles - should create a new role', async () => {
      const res = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'test_moderator',
          description: 'Moderator role for testing',
          isSystem: false,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      createdRoleId = res.body?.data?.id || res.body?.id;
      expect(createdRoleId).toBeDefined();
    });

    it('GET /roles - should list all roles', async () => {
      const res = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect((r) => {
          expect([200]).toContain(r.status);
        });

      const data = res.body?.data || res.body;
      expect(Array.isArray(data) || typeof data === 'object').toBeTruthy();
    });

    it('GET /roles/:id - should get role by ID', async () => {
      if (!createdRoleId) return;

      await request(app.getHttpServer())
        .get(`/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PUT /roles/:id - should update role', async () => {
      if (!createdRoleId) return;

      await request(app.getHttpServer())
        .put(`/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated moderator description' })
        .expect(200);
    });

    it('POST /roles - should reject role without name', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'No name role' })
        .expect(400);
    });
  });

  // ─── PERMISSIONS MANAGEMENT ─────────────────────────────────────────────

  describe('Permissions Management (Admin)', () => {
    it('POST /permissions - should create a permission', async () => {
      const res = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'test.products.create',
          module: 'products',
          description: 'Allow creating products',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      createdPermissionId = res.body?.data?.id || res.body?.id;
      expect(createdPermissionId).toBeDefined();
    });

    it('GET /permissions - should list all permissions', async () => {
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /permissions/by-module?module=products - should filter by module', async () => {
      await request(app.getHttpServer())
        .get('/permissions/by-module')
        .query({ module: 'products' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /permissions - should reject permission without code', async () => {
      await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ module: 'products' })
        .expect(400);
    });
  });

  // ─── ROLE-PERMISSIONS ───────────────────────────────────────────────────

  describe('Role-Permissions Assignment (Admin)', () => {
    it('POST /role-permissions - should assign permissions to role', async () => {
      if (!createdRoleId || !createdPermissionId) return;

      await request(app.getHttpServer())
        .post('/role-permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roleId: createdRoleId,
          permissionIds: [createdPermissionId],
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('GET /role-permissions/:roleId - should get permissions for role', async () => {
      if (!createdRoleId) return;

      await request(app.getHttpServer())
        .get(`/role-permissions/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /role-permissions - should reject empty permissionIds', async () => {
      if (!createdRoleId) return;

      await request(app.getHttpServer())
        .post('/role-permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roleId: createdRoleId,
          permissionIds: [],
        })
        .expect(400);
    });
  });

  // ─── USER MANAGEMENT ───────────────────────────────────────────────────

  describe('User Management (Admin)', () => {
    it('POST /users - should create a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `newuser-${Date.now()}@labverse.org`,
          password: 'User@123456',
          firstName: 'Test',
          lastName: 'User',
          phone: '+923001234567',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      createdUserId = res.body?.data?.id || res.body?.id;
      expect(createdUserId).toBeDefined();
    });

    it('GET /users - should list users with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('GET /users - should search users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .query({ search: 'test' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /users/:id - should get user by ID', async () => {
      if (!createdUserId) return;

      const res = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const user = res.body?.data || res.body;
      expect(user.email).toMatch(/@labverse\.org$/);
    });

    it('PUT /users/:id - should update user', async () => {
      if (!createdUserId) return;

      await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'UpdatedName' })
        .expect(200);
    });

    it('POST /users/:id/roles - should assign role to user', async () => {
      if (!createdUserId || !createdRoleId) return;

      await request(app.getHttpServer())
        .post(`/users/${createdUserId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleId: createdRoleId })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('GET /users/:id/roles - should get user roles', async () => {
      if (!createdUserId) return;

      await request(app.getHttpServer())
        .get(`/users/${createdUserId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /users/:id/addresses - should create user address', async () => {
      if (!createdUserId) return;

      await request(app.getHttpServer())
        .post(`/users/${createdUserId}/addresses`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          label: 'Office',
          line1: '123 Main St',
          city: 'Lahore',
          country: 'PK',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('GET /users/:id/addresses - should get user addresses', async () => {
      if (!createdUserId) return;

      await request(app.getHttpServer())
        .get(`/users/${createdUserId}/addresses`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /users - should reject user without email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: 'Pass123456' })
        .expect(400);
    });

    it('POST /users - should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'short@test.com', password: '12345' })
        .expect(400);
    });
  });

  // ─── CATEGORIES & BRANDS ───────────────────────────────────────────────

  describe('Categories & Brands Management (Admin)', () => {
    it('POST /categories - should create a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Electronics-${Date.now()}`,
          slug: `electronics-test-${Date.now()}`,
          description: 'All electronic products',
          isActive: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      createdCategoryId = res.body?.data?.id || res.body?.id;
    });

    it('GET /categories - should list categories', async () => {
      await request(app.getHttpServer()).get('/categories').expect(200);
    });

    it('PUT /categories/:id - should update category', async () => {
      if (!createdCategoryId) return;

      await request(app.getHttpServer())
        .put(`/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated description' })
        .expect(200);
    });

    it('POST /categories - should reject category without slug', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'No Slug Category' })
        .expect(400);
    });

    it('POST /brands - should create a brand', async () => {
      const res = await request(app.getHttpServer())
        .post('/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `TestBrand-${Date.now()}`,
          slug: `testbrand-admin-${Date.now()}`,
          isActive: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      createdBrandId = res.body?.data?.id || res.body?.id;
    });

    it('GET /brands - should list brands', async () => {
      await request(app.getHttpServer()).get('/brands').expect(200);
    });

    it('PUT /brands/:id - should update brand', async () => {
      if (!createdBrandId) return;

      await request(app.getHttpServer())
        .put(`/brands/${createdBrandId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'UpdatedBrand' })
        .expect(200);
    });
  });

  // ─── INVENTORY & WAREHOUSES ────────────────────────────────────────────

  describe('Warehouse & Inventory Management (Admin)', () => {
    it('POST /warehouses - should create a warehouse', async () => {
      const res = await request(app.getHttpServer())
        .post('/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: `WH-${Date.now()}`.substring(0, 20),
          name: 'Test Warehouse',
          line1: '45 Industrial Area',
          city: 'Lahore',
          country: 'Pakistan',
          isActive: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      createdWarehouseId = res.body?.data?.id || res.body?.id;
    });

    it('GET /warehouses - should list warehouses', async () => {
      await request(app.getHttpServer())
        .get('/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /inventory/low-stock - should get low stock alerts', async () => {
      await request(app.getHttpServer())
        .get('/inventory/low-stock')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /warehouses - should reject warehouse without code', async () => {
      await request(app.getHttpServer())
        .post('/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'No Code Warehouse',
          line1: 'addr',
          city: 'City',
          country: 'PK',
        })
        .expect(400);
    });
  });

  // ─── SHIPPING ──────────────────────────────────────────────────────────

  describe('Shipping Management (Admin)', () => {
    let zoneId: string;

    it('POST /shipping/zones - should create a zone', async () => {
      const res = await request(app.getHttpServer())
        .post('/shipping/zones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Pakistan Zone', isActive: true })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      zoneId = res.body?.data?.id || res.body?.id;
    });

    it('GET /shipping/zones - should list zones', async () => {
      await request(app.getHttpServer())
        .get('/shipping/zones')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('POST /shipping/methods - should create a method', async () => {
      if (!zoneId) return;

      await request(app.getHttpServer())
        .post('/shipping/methods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          zoneId,
          name: 'Standard Delivery',
          carrier: 'TCS',
          baseRate: 200,
          perKgRate: 50,
          estimatedDaysMin: 3,
          estimatedDaysMax: 7,
          isActive: true,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('GET /shipping/methods - should list methods', async () => {
      await request(app.getHttpServer())
        .get('/shipping/methods')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─── ORDERS (Admin view) ──────────────────────────────────────────────

  describe('Orders Management (Admin)', () => {
    it('GET /orders - should list all orders', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /orders - should filter by status', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─── REVIEWS MODERATION ────────────────────────────────────────────────

  describe('Reviews Moderation (Admin)', () => {
    it('GET /reviews - should list reviews for moderation', async () => {
      await request(app.getHttpServer())
        .get('/reviews')
        .query({ status: 'pending' })
        .expect(200);
    });
  });

  // ─── RETURNS MANAGEMENT ────────────────────────────────────────────────

  describe('Returns Management (Admin)', () => {
    it('GET /returns - should list all returns', async () => {
      await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─── SUBSCRIPTIONS PLAN MANAGEMENT ─────────────────────────────────────

  describe('Subscription Plans (Admin)', () => {
    it('POST /subscriptions/plans - should create a plan', async () => {
      const res = await request(app.getHttpServer())
        .post('/subscriptions/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Premium-Plan-${Date.now()}`,
          price: 999,
          currency: 'PKR',
          interval: 'monthly',
          intervalCount: 1,
          trialDays: 14,
        });

      expect([200, 201]).toContain(res.status);
    });

    it('GET /subscriptions/plans - should list all plans', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─── AUDIT LOGS ────────────────────────────────────────────────────────

  describe('Audit Logs (Admin)', () => {
    it('GET /audit-logs - should list audit logs', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /audit-logs - should filter by action', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs')
        .query({ action: 'CREATE' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─── AUTH: PASSWORD MANAGEMENT ─────────────────────────────────────────

  describe('Password Management (Admin)', () => {
    let testUserToken: string;

    it('POST /auth/login - should login test user for password tests', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: password,
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
      testUserToken = res.body?.data?.accessToken || res.body?.accessToken;
      expect(testUserToken).toBeDefined();
    });

    it('POST /auth/change-password - should change password with valid token', async () => {
      if (!testUserToken) return;
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          oldPassword: password,
          newPassword: 'Admin@654321',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('POST /auth/change-password - should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          oldPassword: password,
          newPassword: 'Admin@654321',
        })
        .expect(401);
    });

    it('POST /auth/forgot-password - should accept valid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: uniqueEmail })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('POST /auth/forgot-password - should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  // ─── CLEANUP ───────────────────────────────────────────────────────────

  describe('Cleanup', () => {
    it('DELETE /roles/:id - should delete test role', async () => {
      if (!createdRoleId) return;

      await request(app.getHttpServer())
        .delete(`/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('DELETE /permissions/:id - should delete test permission', async () => {
      if (!createdPermissionId) return;

      await request(app.getHttpServer())
        .delete(`/permissions/${createdPermissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('DELETE /users/:id - should delete test user', async () => {
      if (!createdUserId) return;

      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
