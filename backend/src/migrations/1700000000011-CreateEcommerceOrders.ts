import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceOrders1700000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // orders
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'address_id', type: 'uuid', isNullable: false },
          { name: 'order_number', type: 'varchar', length: '50', isNullable: false, isUnique: true, default: 'fn_generate_order_number()' },
          { name: 'is_split_order', type: 'boolean', default: false },
          { name: 'parent_order_id', type: 'uuid', isNullable: true },
          { name: 'status', type: 'order_status_enum', isNullable: false, default: `'pending'` },
          { name: 'voucher_id', type: 'uuid', isNullable: true },
          { name: 'voucher_code', type: 'varchar', length: '50', isNullable: true },
          { name: 'currency_code', type: 'varchar', length: '3', isNullable: false, default: `'PKR'` },
          { name: 'exchange_rate', type: 'decimal', precision: 12, scale: 6, default: 1.000000 },
          { name: 'subtotal', type: 'decimal', precision: 14, scale: 2, isNullable: false },
          { name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'delivery_charges', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'gift_wrap_cost', type: 'decimal', precision: 8, scale: 2, default: 0.00 },
          { name: 'total_amount', type: 'decimal', precision: 14, scale: 2, isNullable: false },
          { name: 'payment_method', type: 'payment_method_enum', isNullable: false },
          { name: 'estimated_delivery_at', type: 'timestamptz', isNullable: true },
          { name: 'delivered_at', type: 'timestamptz', isNullable: true },
          { name: 'delivery_instructions', type: 'text', isNullable: true },
          { name: 'delivery_slot_id', type: 'uuid', isNullable: true },
          { name: 'is_gift', type: 'boolean', default: false },
          { name: 'gift_message', type: 'text', isNullable: true },
          { name: 'loyalty_points_earned', type: 'integer', default: 0 },
          { name: 'loyalty_points_used', type: 'integer', default: 0 },
          { name: 'loyalty_discount', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'customer_notes', type: 'text', isNullable: true },
          { name: 'admin_notes', type: 'text', isNullable: true },
          { name: 'cancelled_at', type: 'timestamptz', isNullable: true },
          { name: 'cancelled_by', type: 'uuid', isNullable: true },
          { name: 'cancellation_reason', type: 'text', isNullable: true },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'source_device', type: 'varchar', length: '20', isNullable: true },
          { name: 'checkout_session_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['address_id'], referencedTableName: 'addresses', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['parent_order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['cancelled_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // order_items
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'seller_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'warehouse_id', type: 'uuid', isNullable: true },
          { name: 'product_name', type: 'varchar', length: '300', isNullable: false },
          { name: 'variant_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'sku', type: 'varchar', length: '100', isNullable: true },
          { name: 'product_image', type: 'varchar', length: '500', isNullable: true },
          { name: 'quantity', type: 'integer', isNullable: false },
          { name: 'cancelled_qty', type: 'integer', default: 0 },
          { name: 'returned_qty', type: 'integer', default: 0 },
          { name: 'fulfilled_qty', type: 'integer', default: 0 },
          { name: 'unit_price', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'total_price', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, isNullable: false },
          { name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'seller_amount', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'status', type: 'order_item_status_enum', default: `'pending'` },
          { name: 'weight', type: 'decimal', precision: 10, scale: 3, isNullable: true },
          { name: 'is_gift', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['warehouse_id'], referencedTableName: 'warehouses', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // order_status_history
    await queryRunner.createTable(
      new Table({
        name: 'order_status_history',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'order_item_id', type: 'uuid', isNullable: true },
          { name: 'from_status', type: 'varchar', length: '30', isNullable: true },
          { name: 'to_status', type: 'varchar', length: '30', isNullable: false },
          { name: 'changed_by', type: 'uuid', isNullable: true },
          { name: 'change_reason', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['order_item_id'], referencedTableName: 'order_items', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['changed_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // shipments
    await queryRunner.createTable(
      new Table({
        name: 'shipments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'shipment_number', type: 'varchar', length: '50', isNullable: true, isUnique: true },
          { name: 'carrier_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'carrier_code', type: 'varchar', length: '50', isNullable: true },
          { name: 'shipping_method', type: 'shipping_method_type_enum', isNullable: true },
          { name: 'tracking_number', type: 'varchar', length: '100', isNullable: true },
          { name: 'tracking_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'status', type: 'shipment_status_enum', default: `'pending'` },
          { name: 'weight', type: 'decimal', precision: 10, scale: 3, isNullable: true },
          { name: 'length', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'width', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'height', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'package_count', type: 'integer', default: 1 },
          { name: 'shipped_from_warehouse', type: 'uuid', isNullable: true },
          { name: 'shipping_cost', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'insurance_cost', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'shipping_label_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'estimated_delivery_at', type: 'timestamptz', isNullable: true },
          { name: 'shipped_at', type: 'timestamptz', isNullable: true },
          { name: 'delivered_at', type: 'timestamptz', isNullable: true },
          { name: 'signature_required', type: 'boolean', default: false },
          { name: 'delivery_proof_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'delivery_notes', type: 'text', isNullable: true },
          { name: 'receiver_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['shipped_from_warehouse'], referencedTableName: 'warehouses', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // shipment_items
    await queryRunner.createTable(
      new Table({
        name: 'shipment_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'shipment_id', type: 'uuid', isNullable: false },
          { name: 'order_item_id', type: 'uuid', isNullable: false },
          { name: 'quantity', type: 'integer', isNullable: false },
        ],
        uniques: [new TableUnique({ columnNames: ['shipment_id', 'order_item_id'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['shipment_id'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['order_item_id'], referencedTableName: 'order_items', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // order_snapshots
    await queryRunner.createTable(
      new Table({
        name: 'order_snapshots',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'order_item_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'product_data', type: 'jsonb', isNullable: false },
          { name: 'variant_data', type: 'jsonb', isNullable: true },
          { name: 'seller_data', type: 'jsonb', isNullable: false },
          { name: 'attributes', type: 'jsonb', isNullable: true },
          { name: 'images', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['order_item_id'], referencedTableName: 'order_items', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_parent ON orders(parent_order_id) WHERE parent_order_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_pending_payment ON orders(created_at) WHERE status = 'pending_payment'`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_voucher ON orders(voucher_id) WHERE voucher_id IS NOT NULL`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id, status, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id) WHERE variant_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_status_history_item ON order_status_history(order_item_id, created_at DESC) WHERE order_item_id IS NOT NULL`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number) WHERE tracking_number IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier_code, status)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON shipment_items(shipment_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_shipment_items_order_item ON shipment_items(order_item_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_snapshots_item ON order_snapshots(order_item_id)`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_total_non_negative') THEN
          ALTER TABLE orders ADD CONSTRAINT chk_orders_total_non_negative CHECK (total_amount >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_subtotal_positive') THEN
          ALTER TABLE orders ADD CONSTRAINT chk_orders_subtotal_positive CHECK (subtotal > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_delivery_charges_non_negative') THEN
          ALTER TABLE orders ADD CONSTRAINT chk_orders_delivery_charges_non_negative CHECK (delivery_charges >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_loyalty_points') THEN
          ALTER TABLE orders ADD CONSTRAINT chk_orders_loyalty_points CHECK (loyalty_points_used >= 0 AND loyalty_points_earned >= 0);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_qty_positive') THEN
          ALTER TABLE order_items ADD CONSTRAINT chk_order_items_qty_positive CHECK (quantity > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_unit_price_positive') THEN
          ALTER TABLE order_items ADD CONSTRAINT chk_order_items_unit_price_positive CHECK (unit_price > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_total_price') THEN
          ALTER TABLE order_items ADD CONSTRAINT chk_order_items_total_price CHECK (total_price > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_commission') THEN
          ALTER TABLE order_items ADD CONSTRAINT chk_order_items_commission CHECK (commission_rate >= 0 AND commission_rate <= 100);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_cancelled_qty') THEN
          ALTER TABLE order_items ADD CONSTRAINT chk_order_items_cancelled_qty CHECK (cancelled_qty >= 0 AND cancelled_qty <= quantity);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_returned_qty') THEN
          ALTER TABLE order_items ADD CONSTRAINT chk_order_items_returned_qty CHECK (returned_qty >= 0 AND returned_qty <= quantity);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shipment_items_qty_positive') THEN
          ALTER TABLE shipment_items ADD CONSTRAINT chk_shipment_items_qty_positive CHECK (quantity > 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_shipments_updated_at ON shipments`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_order_items_updated_at ON order_items`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders`);
    await queryRunner.dropTable('order_snapshots', true);
    await queryRunner.dropTable('shipment_items', true);
    await queryRunner.dropTable('shipments', true);
    await queryRunner.dropTable('order_status_history', true);
    await queryRunner.dropTable('order_items', true);
    await queryRunner.dropTable('orders', true);
  }
}
