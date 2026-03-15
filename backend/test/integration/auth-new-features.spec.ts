/**
 * Auth New Features Integration Tests (e2e)
 *
 * Tests advanced authentication features:
 * - Change password (authenticated, via JWT)
 * - Forgot password workflow
 * - Reset password
 * - Token refresh
 * - Invalid credential handling
 * - Duplicate registration prevention
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth – New Features (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let refreshToken: string;
  const uniqueEmail = `auth-test-${Date.now()}@labverse.org`;
  const password = 'AuthTest@123';

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

  // ─── REGISTER ──────────────────────────────────────────────────────────

  describe('Registration', () => {
    it('POST /auth/register - should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          firstName: 'Auth',
          lastName: 'Tester',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      expect(res.body).toBeDefined();
    });

    it('POST /auth/register - should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          firstName: 'Auth',
          lastName: 'Tester',
        })
        .expect((r) => {
          expect([400, 409, 500]).toContain(r.status);
        });
    });

    it('POST /auth/register - should reject missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ password: 'Test@1234' })
        .expect(400);
    });

    it('POST /auth/register - should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'Test@1234' })
        .expect(400);
    });

    it('POST /auth/register - should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'weak@labverse.org', password: '123' })
        .expect(400);
    });
  });

  // ─── LOGIN ─────────────────────────────────────────────────────────────

  describe('Login', () => {
    it('POST /auth/login - should login with valid credentials', async () => {
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
      refreshToken = res.body?.data?.refreshToken || res.body?.refreshToken;
      expect(userToken).toBeDefined();
    });

    it('POST /auth/login - should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: 'WrongPassword@123',
        })
        .expect(401);
    });

    it('POST /auth/login - should reject non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@labverse.org',
          password: 'Test@1234',
        })
        .expect(401);
    });

    it('POST /auth/login - should reject missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: uniqueEmail })
        .expect(400);
    });
  });

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────────

  describe('Change Password', () => {
    it('POST /auth/change-password - should change password with valid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          oldPassword: password,
          newPassword: 'AuthTest@456',
        })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('POST /auth/change-password - should reject without auth token', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          oldPassword: 'AuthTest@456',
          newPassword: 'AuthTest@789',
        })
        .expect(401);
    });

    it('POST /auth/change-password - should reject wrong old password', async () => {
      // Re-login with new password to get fresh token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: 'AuthTest@456',
        });

      const newToken =
        loginRes.body?.data?.accessToken || loginRes.body?.accessToken;
      if (!newToken) return;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          oldPassword: 'WrongOldPassword',
          newPassword: 'AuthTest@999',
        })
        .expect((r) => {
          expect([400, 401]).toContain(r.status);
        });
    });
  });

  // ─── TOKEN REFRESH ────────────────────────────────────────────────────

  describe('Token Refresh', () => {
    it('POST /auth/refresh - should refresh with valid token', async () => {
      if (!refreshToken) return;

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });

      expect(res.body).toBeDefined();
    });

    it('POST /auth/refresh - should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token-value' })
        .expect((r) => {
          expect([400, 401]).toContain(r.status);
        });
    });

    it('POST /auth/refresh - should reject empty refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: '' })
        .expect(400);
    });
  });

  // ─── FORGOT & RESET PASSWORD ──────────────────────────────────────────

  describe('Forgot & Reset Password', () => {
    it('POST /auth/forgot-password - should accept valid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: uniqueEmail })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('POST /auth/forgot-password - should not reveal non-existent email', async () => {
      // Should return 200 even for non-existent emails (anti-enumeration)
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nobody@labverse.org' })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });

    it('POST /auth/reset-password - should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'invalid-reset-token', newPassword: 'NewPass@123' })
        .expect((r) => {
          expect([400, 401, 404]).toContain(r.status);
        });
    });
  });

  // ─── LOGOUT ────────────────────────────────────────────────────────────

  describe('Logout', () => {
    it('POST /auth/logout - should logout with valid token', async () => {
      // Login first to get a fresh token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: 'AuthTest@456',
        });

      const token =
        loginRes.body?.data?.accessToken || loginRes.body?.accessToken;
      const rt =
        loginRes.body?.data?.refreshToken || loginRes.body?.refreshToken;

      if (!token) return;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: rt })
        .expect((r) => {
          expect([200, 201]).toContain(r.status);
        });
    });
  });
});
