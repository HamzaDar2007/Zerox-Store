/**
 * Seed File 2 — Role-Based Permission Assignment
 *
 * Assigns scoped permissions to admin, seller, and customer roles based
 * on their logical responsibilities:
 *
 *  • admin    — broad management (excludes system-critical settings,
 *               feature flags, audit log deletion, and role/permission
 *               management).
 *  • seller   — manages own products, orders, store, inventory,
 *               vouchers, bundles, conversations, and subscriptions.
 *  • customer — limited to own profile, addresses, orders, cart,
 *               wishlist, reviews, tickets, notifications, and chat.
 *
 * Depends on Seed 1 having created the roles first.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register ./seeds/seed-role-permissions.ts
 *   — or —
 *   npm run seed:role-permissions
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

// ─── Permission definitions per role ─────────────────────────────────

/**
 * ADMIN — broad management access.
 * Has everything except:
 *  - system_settings.manage, feature_flags.manage (system-critical)
 *  - roles/permissions manage/assign (reserved for super_admin)
 *  - audit_logs deletion
 *  - bulk_operations.manage
 */
const ADMIN_PERMISSIONS: Record<string, string[]> = {
  // ── Users ──────────────────────────────
  users:              ['create', 'read', 'update', 'delete', 'manage', 'export'],
  roles:              ['read'],
  permissions:        ['read'],
  user_roles:         ['read', 'assign'],
  sessions:           ['read', 'delete'],
  addresses:          ['read', 'update'],

  // ── Sellers & Stores ───────────────────
  sellers:            ['create', 'read', 'update', 'delete', 'manage', 'approve', 'export'],
  stores:             ['create', 'read', 'update', 'delete', 'manage'],
  seller_wallets:     ['read', 'manage', 'export'],
  seller_documents:   ['read', 'update', 'approve'],
  seller_violations:  ['create', 'read', 'update', 'delete', 'manage'],

  // ── Catalog ────────────────────────────
  categories:         ['create', 'read', 'update', 'delete', 'manage', 'export'],
  brands:             ['create', 'read', 'update', 'delete', 'manage', 'export'],
  attributes:         ['create', 'read', 'update', 'delete', 'manage'],
  products:           ['create', 'read', 'update', 'delete', 'manage', 'approve', 'export', 'import'],
  product_questions:  ['read', 'update', 'delete', 'moderate'],

  // ── Inventory & Warehouses ─────────────
  inventory:          ['create', 'read', 'update', 'delete', 'manage', 'export'],
  warehouses:         ['create', 'read', 'update', 'delete', 'manage'],

  // ── Cart (admin view) ──────────────────
  carts:              ['read', 'manage'],

  // ── Orders & Shipments ─────────────────
  orders:             ['create', 'read', 'update', 'delete', 'manage', 'export', 'approve'],
  shipments:          ['create', 'read', 'update', 'delete', 'manage', 'export'],

  // ── Payments & Refunds ─────────────────
  payments:           ['read', 'manage', 'export'],
  refunds:            ['create', 'read', 'update', 'approve', 'manage', 'export'],

  // ── Returns & Disputes ─────────────────
  returns:            ['create', 'read', 'update', 'approve', 'manage', 'export'],
  disputes:           ['create', 'read', 'update', 'manage', 'assign', 'export'],

  // ── Reviews ────────────────────────────
  reviews:            ['read', 'update', 'delete', 'moderate', 'export'],

  // ── Marketing ──────────────────────────
  vouchers:           ['create', 'read', 'update', 'delete', 'manage', 'export'],
  campaigns:          ['create', 'read', 'update', 'delete', 'manage'],
  flash_sales:        ['create', 'read', 'update', 'delete', 'manage'],

  // ── Tax & Shipping ─────────────────────
  tax:                ['create', 'read', 'update', 'delete', 'manage'],
  shipping:           ['create', 'read', 'update', 'delete', 'manage'],

  // ── Search (analytics) ─────────────────
  search:             ['read', 'manage', 'export'],

  // ── Notifications ──────────────────────
  notifications:      ['create', 'read', 'update', 'delete', 'manage'],

  // ── Chat & Tickets ─────────────────────
  conversations:      ['read', 'manage'],
  tickets:            ['create', 'read', 'update', 'manage', 'assign', 'export'],

  // ── Loyalty & Referrals ────────────────
  loyalty:            ['create', 'read', 'update', 'delete', 'manage', 'export'],
  referrals:          ['read', 'manage', 'export'],

  // ── Bundles & Subscriptions ────────────
  bundles:            ['create', 'read', 'update', 'delete', 'manage'],
  subscriptions:      ['read', 'update', 'manage', 'export'],

  // ── CMS ────────────────────────────────
  banners:            ['create', 'read', 'update', 'delete', 'manage'],
  pages:              ['create', 'read', 'update', 'delete', 'manage'],

  // ── SEO ────────────────────────────────
  seo:                ['create', 'read', 'update', 'delete', 'manage'],

  // ── I18n ───────────────────────────────
  languages:          ['create', 'read', 'update', 'delete', 'manage'],
  currencies:         ['create', 'read', 'update', 'delete', 'manage'],

  // ── System (read-only for admin) ───────
  system_settings:    ['read'],
  feature_flags:      ['read'],
  audit_logs:         ['read', 'export'],
  import_export:      ['create', 'read', 'manage'],
  bulk_operations:    ['create', 'read'],
};

/**
 * SELLER — manages own products, orders, store, inventory.
 * Cannot access other users, system settings, admin tools, etc.
 */
const SELLER_PERMISSIONS: Record<string, string[]> = {
  // Own profile & addresses
  users:              ['read', 'update'],
  addresses:          ['create', 'read', 'update', 'delete'],

  // Own seller profile & store
  sellers:            ['read', 'update'],
  stores:             ['read', 'update'],
  seller_wallets:     ['read'],
  seller_documents:   ['create', 'read'],

  // Own products & catalog
  products:           ['create', 'read', 'update', 'delete'],
  product_questions:  ['read', 'create'],  // answer questions

  // Own inventory & warehouses
  inventory:          ['create', 'read', 'update'],
  warehouses:         ['create', 'read', 'update', 'delete'],

  // Orders where seller is involved
  orders:             ['read', 'update'],
  shipments:          ['create', 'read', 'update'],

  // Payments & refunds involving seller
  payments:           ['read'],
  refunds:            ['read'],

  // Returns for seller's products
  returns:            ['read', 'update'],

  // Disputes involving seller
  disputes:           ['read', 'create', 'update'],

  // Reviews of seller's products (read & reply)
  reviews:            ['read'],

  // Seller's own vouchers
  vouchers:           ['create', 'read', 'update', 'delete'],

  // Flash sales participation
  flash_sales:        ['read'],

  // Chat with customers
  conversations:      ['read', 'create'],

  // Seller analytics
  search:             ['read'],

  // Notifications
  notifications:      ['read', 'update'],

  // Own bundles
  bundles:            ['create', 'read', 'update', 'delete'],

  // Subscriptions to their products
  subscriptions:      ['read', 'update'],

  // Read categories, brands, attributes (needed for product creation)
  categories:         ['read'],
  brands:             ['read'],
  attributes:         ['read'],

  // Shipping rates / methods (read to configure)
  shipping:           ['read'],
  tax:                ['read'],

  // Support tickets
  tickets:            ['create', 'read', 'update'],

  // Import/export own data
  import_export:      ['create', 'read'],
};

/**
 * CUSTOMER — limited to own profile, orders, and interactions.
 * Cannot access admin, seller, or system resources.
 */
const CUSTOMER_PERMISSIONS: Record<string, string[]> = {
  // Own profile & addresses
  users:              ['read', 'update'],
  addresses:          ['create', 'read', 'update', 'delete'],

  // Browse catalog (read-only)
  categories:         ['read'],
  brands:             ['read'],
  attributes:         ['read'],
  products:           ['read'],
  product_questions:  ['read', 'create'],  // ask questions

  // Own cart, wishlist, checkout
  carts:              ['read', 'update', 'delete'],
  wishlists:          ['create', 'read', 'delete'],
  checkout:           ['create', 'read'],

  // Own orders (read + limited update for cancellation)
  orders:             ['read'],
  shipments:          ['read'],

  // Payments (own)
  payments:           ['read'],

  // Returns & refunds (own)
  returns:            ['create', 'read'],
  refunds:            ['read'],

  // Disputes (own)
  disputes:           ['create', 'read', 'update'],

  // Reviews (write + manage own)
  reviews:            ['create', 'read', 'update', 'delete'],

  // Chat with sellers
  conversations:      ['create', 'read'],

  // Notifications (own)
  notifications:      ['read', 'update'],

  // Search & recently viewed
  search:             ['read'],

  // Support tickets (own)
  tickets:            ['create', 'read', 'update'],

  // Loyalty (own)
  loyalty:            ['read'],
  referrals:          ['read'],

  // Stores (follow/view)
  stores:             ['read'],

  // Subscriptions (own)
  subscriptions:      ['create', 'read', 'update'],

  // Browse Marketing
  vouchers:           ['read'],
  campaigns:          ['read'],
  flash_sales:        ['read'],

  // CMS pages (public)
  pages:              ['read'],
  banners:            ['read'],

  // I18n (read to choose language/currency)
  languages:          ['read'],
  currencies:         ['read'],
};

// ─── Main ────────────────────────────────────────────────────────────
async function seed() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    console.log('\n🌱  Seed 2 — Role-Based Permission Assignment\n');

    // Helper: get role id by name
    async function getRoleId(name: string): Promise<string> {
      const [row] = await qr.query(
        `SELECT id FROM roles WHERE name = $1`,
        [name],
      );
      if (!row) throw new Error(`Role "${name}" not found. Run Seed 1 first.`);
      return row.id;
    }

    // Helper: assign a set of permissions to a role
    async function assignPermissions(
      roleName: string,
      permMap: Record<string, string[]>,
    ): Promise<number> {
      const roleId = await getRoleId(roleName);
      let count = 0;

      for (const [module, actions] of Object.entries(permMap)) {
        for (const action of actions) {
          await qr.query(
            `INSERT INTO permissions (role_id, module, action)
             VALUES ($1, $2, $3)
             ON CONFLICT (role_id, module, action) DO NOTHING`,
            [roleId, module, action],
          );
          count++;
        }
      }

      return count;
    }

    // ── Assign to admin ──────────────────────────────────────────────
    console.log('📋 Assigning permissions to admin…');
    const adminCount = await assignPermissions('admin', ADMIN_PERMISSIONS);
    console.log(`   ✅ admin: ${adminCount} permissions across ${Object.keys(ADMIN_PERMISSIONS).length} modules`);

    // ── Assign to seller ─────────────────────────────────────────────
    console.log('📋 Assigning permissions to seller…');
    const sellerCount = await assignPermissions('seller', SELLER_PERMISSIONS);
    console.log(`   ✅ seller: ${sellerCount} permissions across ${Object.keys(SELLER_PERMISSIONS).length} modules`);

    // ── Assign to customer ───────────────────────────────────────────
    console.log('📋 Assigning permissions to customer…');
    const customerCount = await assignPermissions('customer', CUSTOMER_PERMISSIONS);
    console.log(`   ✅ customer: ${customerCount} permissions across ${Object.keys(CUSTOMER_PERMISSIONS).length} modules`);

    // ── Summary ──────────────────────────────────────────────────────
    await qr.commitTransaction();

    // Count totals from DB for verification
    const roles = ['admin', 'seller', 'customer'];
    console.log('\n' + '═'.repeat(60));
    console.log('  ROLE PERMISSION SUMMARY');
    console.log('═'.repeat(60));

    for (const roleName of roles) {
      const [{ count }] = await qr.query(
        `SELECT COUNT(*)::int AS count FROM permissions p
         JOIN roles r ON p.role_id = r.id
         WHERE r.name = $1`,
        [roleName],
      );
      const moduleCount = Object.keys(
        roleName === 'admin'
          ? ADMIN_PERMISSIONS
          : roleName === 'seller'
            ? SELLER_PERMISSIONS
            : CUSTOMER_PERMISSIONS,
      ).length;
      console.log(
        `  ${roleName.padEnd(12)} → ${String(count).padStart(3)} permissions across ${moduleCount} modules`,
      );
    }

    console.log('═'.repeat(60));
    console.log('\n✅  Seed 2 complete — admin, seller, customer permissions assigned.\n');
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
