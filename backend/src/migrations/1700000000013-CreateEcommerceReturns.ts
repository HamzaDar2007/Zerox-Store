import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEcommerceReturns1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // return_reasons
    await queryRunner.createTable(
      new Table({
        name: 'return_reasons',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'reason_text', type: 'varchar', length: '200', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'applicable_to', type: 'return_type_enum', isNullable: true },
          { name: 'requires_image', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // return_requests
    await queryRunner.createTable(
      new Table({
        name: 'return_requests',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'return_number', type: 'varchar', length: '50', isNullable: false, isUnique: true, default: 'fn_generate_return_number()' },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'order_item_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'seller_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'return_type_enum', isNullable: false },
          { name: 'reason_id', type: 'uuid', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'quantity', type: 'integer', isNullable: false },
          { name: 'status', type: 'return_status_enum', default: `'requested'` },
          { name: 'exchange_variant_id', type: 'uuid', isNullable: true },
          { name: 'refund_id', type: 'uuid', isNullable: true },
          { name: 'refund_amount', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'approved_by', type: 'uuid', isNullable: true },
          { name: 'approved_at', type: 'timestamptz', isNullable: true },
          { name: 'rejected_reason', type: 'text', isNullable: true },
          { name: 'seller_note', type: 'text', isNullable: true },
          { name: 'admin_note', type: 'text', isNullable: true },
          { name: 'qc_status', type: 'varchar', length: '30', isNullable: true },
          { name: 'qc_note', type: 'text', isNullable: true },
          { name: 'qc_completed_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['order_item_id'], referencedTableName: 'order_items', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['reason_id'], referencedTableName: 'return_reasons', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['exchange_variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['approved_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // return_images
    await queryRunner.createTable(
      new Table({
        name: 'return_images',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'return_request_id', type: 'uuid', isNullable: false },
          { name: 'image_url', type: 'varchar', length: '500', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['return_request_id'], referencedTableName: 'return_requests', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // return_shipments
    await queryRunner.createTable(
      new Table({
        name: 'return_shipments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'return_request_id', type: 'uuid', isNullable: false },
          { name: 'tracking_number', type: 'varchar', length: '100', isNullable: true },
          { name: 'carrier_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'carrier_code', type: 'varchar', length: '50', isNullable: true },
          { name: 'status', type: 'return_shipment_status_enum', default: `'pending_pickup'` },
          { name: 'pickup_scheduled_at', type: 'timestamptz', isNullable: true },
          { name: 'picked_up_at', type: 'timestamptz', isNullable: true },
          { name: 'shipped_at', type: 'timestamptz', isNullable: true },
          { name: 'received_at', type: 'timestamptz', isNullable: true },
          { name: 'shipping_cost', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'paid_by', type: 'varchar', length: '20', default: `'buyer'` },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['return_request_id'], referencedTableName: 'return_requests', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_requests_user ON return_requests(user_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_requests_seller ON return_requests(seller_id, status, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_requests_pending ON return_requests(created_at DESC) WHERE status = 'requested'`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_images_request ON return_images(return_request_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_shipments_request ON return_shipments(return_request_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_return_shipments_tracking ON return_shipments(tracking_number) WHERE tracking_number IS NOT NULL`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_return_requests_updated_at BEFORE UPDATE ON return_requests FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_return_shipments_updated_at BEFORE UPDATE ON return_shipments FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_return_qty_positive') THEN
          ALTER TABLE return_requests ADD CONSTRAINT chk_return_qty_positive CHECK (quantity > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_return_refund_amount') THEN
          ALTER TABLE return_requests ADD CONSTRAINT chk_return_refund_amount CHECK (refund_amount IS NULL OR refund_amount >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_return_shipments_updated_at ON return_shipments`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_return_requests_updated_at ON return_requests`);
    await queryRunner.dropTable('return_shipments', true);
    await queryRunner.dropTable('return_images', true);
    await queryRunner.dropTable('return_requests', true);
    await queryRunner.dropTable('return_reasons', true);
  }
}
