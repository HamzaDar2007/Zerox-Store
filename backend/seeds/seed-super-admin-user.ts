/**
 * Seed File 3 — Super Admin User
 *
 * Creates a default super admin user with securely hashed password and
 * assigns them the super_admin role via both the users.role enum field
 * AND the user_roles join table.
 *
 * Credentials are read from environment variables with sensible defaults
 * for development. For production, configure via .env or CI secrets:
 *
 *   SUPER_ADMIN_NAME=...
 *   SUPER_ADMIN_EMAIL=...
 *   SUPER_ADMIN_PASSWORD=...
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register ./seeds/seed-super-admin-user.ts
 *   — or —
 *   npm run seed:super-admin
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

// ─── Connection ──────────────────────────────────────────────────────
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecommerce',
  synchronize: false,
  logging: false,
});

// ─── Configurable credentials ────────────────────────────────────────
const SUPER_ADMIN = {
  name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
  email: process.env.SUPER_ADMIN_EMAIL || 'husnainramzan7194@gmail.com',
  password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123!',
  phone: process.env.SUPER_ADMIN_PHONE || '+923000000000',
};

const BCRYPT_SALT_ROUNDS = 10; // matches project convention (auth.service/users.service)

// ─── Main ────────────────────────────────────────────────────────────
async function seed() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    console.log('\n🌱  Seed 3 — Super Admin User\n');

    // 1. Hash password ────────────────────────────────────────────────
    console.log('🔒 Hashing password with bcrypt…');
    const hashedPassword = await bcrypt.hash(
      SUPER_ADMIN.password,
      BCRYPT_SALT_ROUNDS,
    );

    // 2. Upsert super admin user ──────────────────────────────────────
    console.log(`📧 Email: ${SUPER_ADMIN.email}`);

    const [existingUser] = await qr.query(
      `SELECT id FROM users WHERE email = $1`,
      [SUPER_ADMIN.email],
    );

    let userId: string;

    if (existingUser) {
      // Update existing user to ensure they have super_admin role & active status
      userId = existingUser.id;
      await qr.query(
        `UPDATE users SET
           name              = $1,
           password          = $2,
           phone             = $3,
           role              = 'super_admin',
           is_active         = true,
           is_email_verified = true,
           email_verified_at = NOW(),
           updated_at        = NOW()
         WHERE id = $4`,
        [SUPER_ADMIN.name, hashedPassword, SUPER_ADMIN.phone, userId],
      );
      console.log(`  ✅ Updated existing user (${userId})`);
    } else {
      // Create new user
      const [newUser] = await qr.query(
        `INSERT INTO users (
           name, email, password, phone, role,
           is_active, is_email_verified, email_verified_at
         ) VALUES ($1, $2, $3, $4, 'super_admin', true, true, NOW())
         RETURNING id`,
        [SUPER_ADMIN.name, SUPER_ADMIN.email, hashedPassword, SUPER_ADMIN.phone],
      );
      userId = newUser.id;
      console.log(`  ✅ Created new user (${userId})`);
    }

    // 3. Get super_admin role id ──────────────────────────────────────
    const [superAdminRole] = await qr.query(
      `SELECT id FROM roles WHERE name = 'super_admin'`,
    );
    if (!superAdminRole) {
      throw new Error(
        'super_admin role not found. Run Seed 1 first to create roles.',
      );
    }

    // 4. Assign super_admin role via user_roles join table ────────────
    await qr.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by)
       VALUES ($1, $2, $1)
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, superAdminRole.id],
    );
    console.log(`  ✅ Assigned super_admin role in user_roles table`);

    // 5. Verify ───────────────────────────────────────────────────────
    const [verifyUser] = await qr.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_active, u.is_email_verified
       FROM users u WHERE u.id = $1`,
      [userId],
    );

    const [roleAssignment] = await qr.query(
      `SELECT ur.id, r.name AS role_name
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [userId],
    );

    const [permCount] = await qr.query(
      `SELECT COUNT(*)::int AS count
       FROM permissions p
       JOIN roles r ON p.role_id = r.id
       WHERE r.name = 'super_admin'`,
    );

    await qr.commitTransaction();

    // 6. Summary ──────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('  SUPER ADMIN USER CREATED');
    console.log('═'.repeat(60));
    console.log(`  ID:               ${verifyUser.id}`);
    console.log(`  Name:             ${verifyUser.name}`);
    console.log(`  Email:            ${verifyUser.email}`);
    console.log(`  Role (enum):      ${verifyUser.role}`);
    console.log(`  Role (table):     ${roleAssignment?.role_name || 'N/A'}`);
    console.log(`  Active:           ${verifyUser.is_active}`);
    console.log(`  Email Verified:   ${verifyUser.is_email_verified}`);
    console.log(`  Permissions:      ${permCount.count} (via super_admin role)`);
    console.log('═'.repeat(60));
    console.log('\n  🔑 Login credentials:');
    console.log(`     Email:    ${SUPER_ADMIN.email}`);
    console.log(`     Password: ${SUPER_ADMIN.password}`);
    console.log('\n  ⚠️  Change the password immediately in production!');
    console.log('  💡 Configure via env vars: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD\n');
    console.log('✅  Seed 3 complete — Super Admin user is ready.\n');
  } catch (error) {
    await qr.rollbackTransaction();
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
}

seed();
