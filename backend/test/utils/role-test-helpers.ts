/**
 * Shared helpers for role-based route testing.
 *
 * Provides login helpers, ID extraction, and a full Nest app factory
 * so each role spec file can run against the live database.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';

// ─── App Factory ─────────────────────────────────────────────────────
export async function createApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

// ─── Auth Helpers ────────────────────────────────────────────────────
export interface AuthResult {
  token: string;
  userId: string;
  refreshToken?: string;
}

export async function registerAndLogin(
  app: INestApplication,
  email: string,
  password: string,
  firstName = 'Test',
  lastName = 'User',
): Promise<AuthResult> {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, firstName, lastName });

  return login(app, email, password);
}

export async function login(
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  const body = res.body?.data || res.body;
  return {
    token: body?.accessToken ?? '',
    userId: body?.user?.id ?? '',
    refreshToken: body?.refreshToken,
  };
}

// ─── Role Assignment (direct DB) ─────────────────────────────────────
export async function assignRole(
  app: INestApplication,
  userId: string,
  roleName: string,
): Promise<void> {
  const ds = app.get(DataSource);
  const [role] = await ds.query(
    `SELECT id FROM roles WHERE name = $1 LIMIT 1`,
    [roleName],
  );
  if (role) {
    await ds.query(
      `INSERT INTO user_roles (user_id, role_id, granted_by) VALUES ($1, $2, $1) ON CONFLICT DO NOTHING`,
      [userId, role.id],
    );
  }
}

// ─── ID Extraction ───────────────────────────────────────────────────
export function extractId(res: request.Response): string {
  return res.body?.data?.id || res.body?.id || '';
}

export function extractData(res: request.Response): any {
  return res.body?.data || res.body;
}

// ─── Super Admin Credentials ─────────────────────────────────────────
export const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || 'husnainramzan7194@gmail.com';
export const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123!';

// ─── Unique Generators ──────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const uniqueEmail = (prefix: string) => `${prefix}-${uid()}@labverse.org`;
export const uniqueSlug = (prefix: string) => `${prefix}-${uid()}`;
export const uniqueCode = (prefix: string) => `${prefix}-${uid()}`.substring(0, 20);
