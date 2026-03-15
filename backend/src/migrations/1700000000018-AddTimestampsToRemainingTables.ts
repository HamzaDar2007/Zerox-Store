import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToRemainingTables1700000000018 implements MigrationInterface {
  name = 'AddTimestampsToRemainingTables1700000000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'users',
      'auth_sessions',
      'auth_tokens',
      'shipments',
      'carts',
      'cart_items',
      'product_variants',
      'categories',
      'warehouses',
      'inventory',
      'shipping_zones',
      'shipping_methods',
      'subscription_plans',
      'audit_logs',
      'product_images',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      );
      await queryRunner.query(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'users',
      'auth_sessions',
      'auth_tokens',
      'shipments',
      'carts',
      'cart_items',
      'product_variants',
      'categories',
      'warehouses',
      'inventory',
      'shipping_zones',
      'shipping_methods',
      'subscription_plans',
      'audit_logs',
      'product_images',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE ${table} DROP COLUMN IF EXISTS updated_at`,
      );
      await queryRunner.query(
        `ALTER TABLE ${table} DROP COLUMN IF EXISTS created_at`,
      );
    }
  }
}
