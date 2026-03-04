/**
 * Seed File 1 — Permissions & Super Admin Role
 *
 * Creates all system roles and dynamically generates permissions for every
 * resource/module discovered in the database schema, then assigns every
 * single permission to the super_admin role for unrestricted access.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register ./seeds/seed-permissions-super-admin.ts
 *   — or —
 *   npm run seed:permissions-super-admin
 */

import { DataSource } from 'typeorm';
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

// ─── Standard CRUD + extra actions per module ────────────────────────
const STANDARD_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

/**
 * Complete map of every resource module in the system and the actions it
 * supports. Every module gets at least CRUD; some modules receive extra
 * actions that reflect real business operations.
 */
const MODULE_PERMISSIONS: Record<string, readonly string[]> = {
  // ── Auth & Users ───────────────────────
  users:          [...STANDARD_ACTIONS, 'manage', 'export', 'assign'],
  roles:          [...STANDARD_ACTIONS, 'manage', 'assign'],
  permissions:    [...STANDARD_ACTIONS, 'manage', 'assign'],
  user_roles:     [...STANDARD_ACTIONS, 'assign'],
  sessions:       ['read', 'delete', 'manage'],
  addresses:      [...STANDARD_ACTIONS],

  // ── Sellers & Stores ───────────────────
  sellers:        [...STANDARD_ACTIONS, 'manage', 'approve', 'export'],
  stores:         [...STANDARD_ACTIONS, 'manage'],
  seller_wallets: ['read', 'manage', 'export'],
  seller_documents: [...STANDARD_ACTIONS, 'approve'],
  seller_violations: [...STANDARD_ACTIONS, 'manage'],

  // ── Catalog ────────────────────────────
  categories:     [...STANDARD_ACTIONS, 'manage', 'export'],
  brands:         [...STANDARD_ACTIONS, 'manage', 'export'],
  attributes:     [...STANDARD_ACTIONS, 'manage'],
  products:       [...STANDARD_ACTIONS, 'manage', 'approve', 'export', 'import'],
  product_questions: [...STANDARD_ACTIONS, 'moderate'],

  // ── Inventory ──────────────────────────
  inventory:      [...STANDARD_ACTIONS, 'manage', 'export'],
  warehouses:     [...STANDARD_ACTIONS, 'manage'],

  // ── Cart & Checkout ────────────────────
  carts:          ['read', 'update', 'delete', 'manage'],
  wishlists:      [...STANDARD_ACTIONS],
  checkout:       ['read', 'create', 'manage'],

  // ── Orders & Shipments ─────────────────
  orders:         [...STANDARD_ACTIONS, 'manage', 'export', 'approve'],
  shipments:      [...STANDARD_ACTIONS, 'manage', 'export'],

  // ── Payments & Refunds ─────────────────
  payments:       ['read', 'manage', 'export'],
  refunds:        [...STANDARD_ACTIONS, 'approve', 'manage', 'export'],

  // ── Returns & Disputes ─────────────────
  returns:        [...STANDARD_ACTIONS, 'approve', 'manage', 'export'],
  disputes:       [...STANDARD_ACTIONS, 'manage', 'assign', 'export'],

  // ── Reviews ────────────────────────────
  reviews:        [...STANDARD_ACTIONS, 'moderate', 'export'],

  // ── Marketing ──────────────────────────
  vouchers:       [...STANDARD_ACTIONS, 'manage', 'export'],
  campaigns:      [...STANDARD_ACTIONS, 'manage'],
  flash_sales:    [...STANDARD_ACTIONS, 'manage'],

  // ── Tax & Shipping ─────────────────────
  tax:            [...STANDARD_ACTIONS, 'manage'],
  shipping:       [...STANDARD_ACTIONS, 'manage'],

  // ── Search ─────────────────────────────
  search:         ['read', 'manage', 'export'],

  // ── Notifications ──────────────────────
  notifications:  [...STANDARD_ACTIONS, 'manage'],

  // ── Chat & Tickets ─────────────────────
  conversations:  ['read', 'create', 'delete', 'manage'],
  tickets:        [...STANDARD_ACTIONS, 'manage', 'assign', 'export'],

  // ── Loyalty & Referrals ────────────────
  loyalty:        [...STANDARD_ACTIONS, 'manage', 'export'],
  referrals:      ['read', 'manage', 'export'],

  // ── Bundles & Subscriptions ────────────
  bundles:        [...STANDARD_ACTIONS, 'manage'],
  subscriptions:  [...STANDARD_ACTIONS, 'manage', 'export'],

  // ── CMS ────────────────────────────────
  banners:        [...STANDARD_ACTIONS, 'manage'],
  pages:          [...STANDARD_ACTIONS, 'manage'],

  // ── SEO ────────────────────────────────
  seo:            [...STANDARD_ACTIONS, 'manage'],

  // ── I18n ───────────────────────────────
  languages:      [...STANDARD_ACTIONS, 'manage'],
  currencies:     [...STANDARD_ACTIONS, 'manage'],

  // ── System ─────────────────────────────
  system_settings: ['read', 'update', 'manage'],
  feature_flags:  [...STANDARD_ACTIONS, 'manage'],
  audit_logs:     ['read', 'export'],
  import_export:  ['create', 'read', 'manage'],
  bulk_operations: ['create', 'read', 'manage'],
};

// ─── System roles ────────────────────────────────────────────────────
const SYSTEM_ROLES = [
  {
    name: 'super_admin',
    display_name: 'Super Admin',
    description: 'Unrestricted access to the entire platform.',
    is_system: true,
  },
  {
    name: 'admin',
    display_name: 'Admin',
    description: 'Broad management access excluding system-critical operations.',
    is_system: true,
  },
  {
    name: 'seller',
    display_name: 'Seller',
    description: 'Manages own products, orders, and store.',
    is_system: true,
  },
  {
    name: 'customer',
    display_name: 'Customer',
    description: 'Limited access scoped to own profile, orders, and interactions.',
    is_system: true,
  },
  {
    name: 'support_agent',
    display_name: 'Support Agent',
    description: 'Handles customer tickets, disputes, and support queries.',
    is_system: true,
  },
];

// ─── Main ────────────────────────────────────────────────────────────
async function seed() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    console.log('\n🌱  Seed 1 — Permissions & Super Admin Role\n');

    // 1. Upsert roles ─────────────────────────────────────────────────
    console.log('Creating system roles...');
    for (const role of SYSTEM_ROLES) {
      await qr.query(
        `INSERT INTO roles (name, display_name, description, is_system)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           description  = EXCLUDED.description,
           is_system    = EXCLUDED.is_system`,
        [role.name, role.display_name, role.description, role.is_system],
      );
      console.log(`  ✅ Role: ${role.name}`);
    }

    // 2. Resolve super_admin role id ──────────────────────────────────
    const [superAdminRole] = await qr.query(
      `SELECT id FROM roles WHERE name = 'super_admin'`,
    );
    if (!superAdminRole) {
      throw new Error('super_admin role not found after upsert');
    }
    const superAdminRoleId: string = superAdminRole.id;
    console.log(`\n  🔑 super_admin role ID: ${superAdminRoleId}`);

    // 3. Generate ALL permissions ─────────────────────────────────────
    console.log('\nCreating permissions for ALL modules…');
    let totalPermissions = 0;

    for (const [module, actions] of Object.entries(MODULE_PERMISSIONS)) {
      for (const action of actions) {
        // Upsert each permission for the super_admin role
        await qr.query(
          `INSERT INTO permissions (role_id, module, action)
           VALUES ($1, $2, $3)
           ON CONFLICT (role_id, module, action) DO NOTHING`,
          [superAdminRoleId, module, action],
        );
        totalPermissions++;
      }
      console.log(
        `  ✅ ${module.padEnd(22)} → ${(actions as readonly string[]).join(', ')}`,
      );
    }

    // 4. Summary ──────────────────────────────────────────────────────
    const [{ count: dbCount }] = await qr.query(
      `SELECT COUNT(*)::int AS count FROM permissions WHERE role_id = $1`,
      [superAdminRoleId],
    );

    await qr.commitTransaction();

    console.log('\n' + '═'.repeat(60));
    console.log(`  ✅ Roles created:          ${SYSTEM_ROLES.length}`);
    console.log(`  ✅ Modules defined:         ${Object.keys(MODULE_PERMISSIONS).length}`);
    console.log(`  ✅ Permissions generated:   ${totalPermissions}`);
    console.log(`  ✅ super_admin permissions: ${dbCount} (in DB)`);
    console.log('═'.repeat(60));
    console.log('\n✅  Seed 1 complete — super_admin has FULL ACCESS.\n');
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
