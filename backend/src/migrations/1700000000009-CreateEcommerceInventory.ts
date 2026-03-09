import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableUnique,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceInventory1700000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // warehouses
    await queryRunner.createTable(
      new Table({
        name: 'warehouses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'seller_id', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar', length: '200', isNullable: false },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'address_line1',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'address_line2',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          { name: 'city', type: 'varchar', length: '100', isNullable: false },
          { name: 'state', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: false,
            default: `'Pakistan'`,
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'contact_person',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'contact_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'priority', type: 'integer', default: 0 },
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
            columnNames: ['seller_id'],
            referencedTableName: 'sellers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // inventory (GENERATED ALWAYS AS column requires raw SQL)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS inventory (
          id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_id              UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          product_variant_id      UUID REFERENCES product_variants(id) ON DELETE CASCADE,
          warehouse_id            UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
          quantity_on_hand        INTEGER NOT NULL DEFAULT 0,
          quantity_reserved       INTEGER NOT NULL DEFAULT 0,
          quantity_available      INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
          low_stock_threshold     INTEGER DEFAULT 10,
          reorder_point           INTEGER DEFAULT 20,
          reorder_quantity        INTEGER DEFAULT 50,
          last_restocked_at       TIMESTAMPTZ,
          last_sold_at            TIMESTAMPTZ,
          updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(product_id, product_variant_id, warehouse_id)
      )
    `);

    // stock_movements
    await queryRunner.createTable(
      new Table({
        name: 'stock_movements',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'inventory_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'stock_movement_type_enum', isNullable: false },
          { name: 'quantity', type: 'integer', isNullable: false },
          { name: 'quantity_before', type: 'integer', isNullable: false },
          { name: 'quantity_after', type: 'integer', isNullable: false },
          {
            name: 'reference_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          { name: 'reference_id', type: 'uuid', isNullable: true },
          {
            name: 'cost_per_unit',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          { name: 'note', type: 'text', isNullable: true },
          { name: 'performed_by', type: 'uuid', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['inventory_id'],
            referencedTableName: 'inventory',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['performed_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // stock_reservations
    await queryRunner.createTable(
      new Table({
        name: 'stock_reservations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'inventory_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'product_variant_id', type: 'uuid', isNullable: true },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'cart_id', type: 'uuid', isNullable: true },
          { name: 'checkout_session_id', type: 'uuid', isNullable: true },
          { name: 'quantity', type: 'integer', isNullable: false },
          {
            name: 'status',
            type: 'reservation_status_enum',
            isNullable: false,
            default: `'held'`,
          },
          { name: 'expires_at', type: 'timestamptz', isNullable: false },
          { name: 'released_at', type: 'timestamptz', isNullable: true },
          { name: 'committed_at', type: 'timestamptz', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['inventory_id'],
            referencedTableName: 'inventory',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['product_variant_id'],
            referencedTableName: 'product_variants',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // inventory_transfers
    await queryRunner.createTable(
      new Table({
        name: 'inventory_transfers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'transfer_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          { name: 'from_warehouse_id', type: 'uuid', isNullable: false },
          { name: 'to_warehouse_id', type: 'uuid', isNullable: false },
          {
            name: 'status',
            type: 'transfer_status_enum',
            default: `'pending'`,
          },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'initiated_by', type: 'uuid', isNullable: false },
          { name: 'approved_by', type: 'uuid', isNullable: true },
          { name: 'approved_at', type: 'timestamptz', isNullable: true },
          { name: 'shipped_at', type: 'timestamptz', isNullable: true },
          { name: 'completed_at', type: 'timestamptz', isNullable: true },
          { name: 'cancelled_at', type: 'timestamptz', isNullable: true },
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
            columnNames: ['from_warehouse_id'],
            referencedTableName: 'warehouses',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['to_warehouse_id'],
            referencedTableName: 'warehouses',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['initiated_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['approved_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // inventory_transfer_items
    await queryRunner.createTable(
      new Table({
        name: 'inventory_transfer_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'transfer_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'product_variant_id', type: 'uuid', isNullable: true },
          { name: 'quantity_requested', type: 'integer', isNullable: false },
          { name: 'quantity_shipped', type: 'integer', default: 0 },
          { name: 'quantity_received', type: 'integer', default: 0 },
        ],
        uniques: [
          new TableUnique({
            columnNames: ['transfer_id', 'product_id', 'product_variant_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['transfer_id'],
            referencedTableName: 'inventory_transfers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['product_variant_id'],
            referencedTableName: 'product_variants',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_warehouses_seller ON warehouses(seller_id) WHERE seller_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(id) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_warehouses_city ON warehouses(city)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory(product_variant_id) WHERE product_variant_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(warehouse_id) WHERE quantity_on_hand <= low_stock_threshold`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(product_variant_id, warehouse_id, quantity_available)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory ON stock_movements(inventory_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reservations_active ON stock_reservations(expires_at) WHERE status = 'held'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reservations_inventory ON stock_reservations(inventory_id, status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reservations_order ON stock_reservations(order_id) WHERE order_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reservations_cart ON stock_reservations(cart_id) WHERE cart_id IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_transfers_status ON inventory_transfers(status, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_transfers_from ON inventory_transfers(from_warehouse_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_transfers_to ON inventory_transfers(to_warehouse_id)`,
    );

    // Triggers
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_warehouses_updated_at
        BEFORE UPDATE ON warehouses
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_inventory_updated_at
        BEFORE UPDATE ON inventory
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_transfers_updated_at
        BEFORE UPDATE ON inventory_transfers
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventory_qty_non_negative') THEN
          ALTER TABLE inventory ADD CONSTRAINT chk_inventory_qty_non_negative CHECK (quantity_on_hand >= 0 AND quantity_reserved >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventory_reserved_le_onhand') THEN
          ALTER TABLE inventory ADD CONSTRAINT chk_inventory_reserved_le_onhand CHECK (quantity_reserved <= quantity_on_hand);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_stock_movements_qty_nonzero') THEN
          ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_qty_nonzero CHECK (quantity != 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_reservation_qty_positive') THEN
          ALTER TABLE stock_reservations ADD CONSTRAINT chk_reservation_qty_positive CHECK (quantity > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_transfer_diff_warehouses') THEN
          ALTER TABLE inventory_transfers ADD CONSTRAINT chk_transfer_diff_warehouses CHECK (from_warehouse_id != to_warehouse_id);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_transfer_qty_positive') THEN
          ALTER TABLE inventory_transfer_items ADD CONSTRAINT chk_transfer_qty_positive CHECK (quantity_requested > 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_transfers_updated_at ON inventory_transfers`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_warehouses_updated_at ON warehouses`,
    );
    await queryRunner.dropTable('inventory_transfer_items', true);
    await queryRunner.dropTable('inventory_transfers', true);
    await queryRunner.dropTable('stock_reservations', true);
    await queryRunner.dropTable('stock_movements', true);
    await queryRunner.query(`DROP TABLE IF EXISTS inventory`);
    await queryRunner.dropTable('warehouses', true);
  }
}
