import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEcommerceSubscriptions1700000000025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // subscriptions
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'quantity', type: 'integer', isNullable: false, default: 1 },
          { name: 'frequency', type: 'subscription_frequency_enum', isNullable: false },
          { name: 'delivery_address_id', type: 'uuid', isNullable: false },
          { name: 'payment_method_id', type: 'uuid', isNullable: true },
          { name: 'unit_price', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 },
          { name: 'next_delivery_date', type: 'date', isNullable: false },
          { name: 'last_order_date', type: 'date', isNullable: true },
          { name: 'status', type: 'subscription_status_enum', default: `'active'` },
          { name: 'paused_at', type: 'timestamptz', isNullable: true },
          { name: 'cancelled_at', type: 'timestamptz', isNullable: true },
          { name: 'cancellation_reason', type: 'text', isNullable: true },
          { name: 'total_orders', type: 'integer', default: 0 },
          { name: 'total_spent', type: 'decimal', precision: 14, scale: 2, default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['delivery_address_id'], referencedTableName: 'addresses', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['payment_method_id'], referencedTableName: 'saved_payment_methods', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // subscription_orders
    await queryRunner.createTable(
      new Table({
        name: 'subscription_orders',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'subscription_id', type: 'uuid', isNullable: false },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'scheduled_date', type: 'date', isNullable: false },
          { name: 'actual_date', type: 'date', isNullable: true },
          { name: 'status', type: 'varchar', length: '30', default: `'scheduled'` },
          { name: 'failure_reason', type: 'text', isNullable: true },
          { name: 'retry_count', type: 'smallint', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['subscription_id'], referencedTableName: 'subscriptions', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_product ON subscriptions(product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_next_delivery ON subscriptions(next_delivery_date, status) WHERE status = 'active'`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscription_orders_sub ON subscription_orders(subscription_id, scheduled_date DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscription_orders_order ON subscription_orders(order_id) WHERE order_id IS NOT NULL`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_subscription_qty') THEN
          ALTER TABLE subscriptions ADD CONSTRAINT chk_subscription_qty CHECK (quantity > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_subscription_price') THEN
          ALTER TABLE subscriptions ADD CONSTRAINT chk_subscription_price CHECK (unit_price > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_subscription_discount') THEN
          ALTER TABLE subscriptions ADD CONSTRAINT chk_subscription_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 50);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions`);
    await queryRunner.dropTable('subscription_orders', true);
    await queryRunner.dropTable('subscriptions', true);
  }
}
