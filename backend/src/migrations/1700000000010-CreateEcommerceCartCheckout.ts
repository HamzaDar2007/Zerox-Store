import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableUnique,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceCartCheckout1700000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // carts
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true, isUnique: true },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'currency_code',
            type: 'varchar',
            length: '3',
            default: `'PKR'`,
          },
          { name: 'voucher_id', type: 'uuid', isNullable: true },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0.0,
          },
          { name: 'last_activity_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'abandoned_email_sent', type: 'boolean', default: false },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // cart_items
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'cart_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'quantity', type: 'integer', isNullable: false, default: 1 },
          {
            name: 'price_at_addition',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['cart_id', 'product_id', 'variant_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['cart_id'],
            referencedTableName: 'carts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['variant_id'],
            referencedTableName: 'product_variants',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
      true,
    );

    // wishlists
    await queryRunner.createTable(
      new Table({
        name: 'wishlists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'notify_on_sale', type: 'boolean', default: false },
          { name: 'notify_on_restock', type: 'boolean', default: false },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        uniques: [new TableUnique({ columnNames: ['user_id', 'product_id'] })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // checkout_sessions
    await queryRunner.createTable(
      new Table({
        name: 'checkout_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'cart_id', type: 'uuid', isNullable: true },
          {
            name: 'session_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'step',
            type: 'checkout_step_enum',
            default: `'cart_review'`,
          },
          { name: 'shipping_address_id', type: 'uuid', isNullable: true },
          { name: 'billing_address_id', type: 'uuid', isNullable: true },
          { name: 'shipping_method_id', type: 'uuid', isNullable: true },
          { name: 'delivery_slot_id', type: 'uuid', isNullable: true },
          {
            name: 'payment_method',
            type: 'payment_method_enum',
            isNullable: true,
          },
          { name: 'voucher_id', type: 'uuid', isNullable: true },
          { name: 'cart_snapshot', type: 'jsonb', isNullable: true },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'shipping_cost',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0.0,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0.0,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0.0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: true,
          },
          { name: 'price_locked_until', type: 'timestamptz', isNullable: true },
          { name: 'loyalty_points_to_use', type: 'integer', default: 0 },
          {
            name: 'loyalty_discount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0.0,
          },
          { name: 'is_gift', type: 'boolean', default: false },
          { name: 'gift_message', type: 'text', isNullable: true },
          { name: 'delivery_instructions', type: 'text', isNullable: true },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          {
            name: 'device_type',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          { name: 'started_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'completed_at', type: 'timestamptz', isNullable: true },
          { name: 'abandoned_at', type: 'timestamptz', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
          new TableForeignKey({
            columnNames: ['cart_id'],
            referencedTableName: 'carts',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
          new TableForeignKey({
            columnNames: ['shipping_address_id'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['billing_address_id'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_id) WHERE session_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_carts_abandoned ON carts(last_activity_at) WHERE abandoned_email_sent = FALSE`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_checkout_user ON checkout_sessions(user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_checkout_step ON checkout_sessions(step, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_checkout_abandoned ON checkout_sessions(step, started_at) WHERE step != 'completed' AND abandoned_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_checkout_snapshot ON checkout_sessions USING GIN (cart_snapshot)`,
    );

    // Triggers
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_carts_updated_at
        BEFORE UPDATE ON carts
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_cart_items_updated_at
        BEFORE UPDATE ON cart_items
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_checkout_updated_at
        BEFORE UPDATE ON checkout_sessions
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cart_items_qty_positive') THEN
          ALTER TABLE cart_items ADD CONSTRAINT chk_cart_items_qty_positive CHECK (quantity > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cart_items_price_positive') THEN
          ALTER TABLE cart_items ADD CONSTRAINT chk_cart_items_price_positive CHECK (price_at_addition > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_checkout_total_non_negative') THEN
          ALTER TABLE checkout_sessions ADD CONSTRAINT chk_checkout_total_non_negative CHECK (total IS NULL OR total >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_checkout_loyalty_points') THEN
          ALTER TABLE checkout_sessions ADD CONSTRAINT chk_checkout_loyalty_points CHECK (loyalty_points_to_use >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_checkout_updated_at ON checkout_sessions`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts`,
    );
    await queryRunner.dropTable('checkout_sessions', true);
    await queryRunner.dropTable('wishlists', true);
    await queryRunner.dropTable('cart_items', true);
    await queryRunner.dropTable('carts', true);
  }
}
