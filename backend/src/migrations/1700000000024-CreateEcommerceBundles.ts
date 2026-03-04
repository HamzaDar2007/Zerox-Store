import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceBundles1700000000024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // product_bundles
    await queryRunner.createTable(
      new Table({
        name: 'product_bundles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '200', isNullable: false },
          { name: 'slug', type: 'varchar', length: '200', isNullable: false, isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'image_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'discount_type', type: 'voucher_type_enum', isNullable: false, default: `'percentage'` },
          { name: 'discount_value', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'bundle_price', type: 'decimal', precision: 14, scale: 2, isNullable: true },
          { name: 'original_total_price', type: 'decimal', precision: 14, scale: 2, isNullable: true },
          { name: 'starts_at', type: 'timestamptz', isNullable: true },
          { name: 'ends_at', type: 'timestamptz', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'seller_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // bundle_items
    await queryRunner.createTable(
      new Table({
        name: 'bundle_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'bundle_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'quantity', type: 'integer', isNullable: false, default: 1 },
          { name: 'sort_order', type: 'integer', default: 0 },
        ],
        uniques: [new TableUnique({ columnNames: ['bundle_id', 'product_id', 'variant_id'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['bundle_id'], referencedTableName: 'product_bundles', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundles_active ON product_bundles(is_active, created_at DESC) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundles_seller ON product_bundles(seller_id) WHERE seller_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundles_slug ON product_bundles(slug)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id, sort_order)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundle_items_product ON bundle_items(product_id)`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_bundles_updated_at BEFORE UPDATE ON product_bundles FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_bundle_discount_positive') THEN
          ALTER TABLE product_bundles ADD CONSTRAINT chk_bundle_discount_positive CHECK (discount_value > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_bundle_dates') THEN
          ALTER TABLE product_bundles ADD CONSTRAINT chk_bundle_dates CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_bundle_item_qty') THEN
          ALTER TABLE bundle_items ADD CONSTRAINT chk_bundle_item_qty CHECK (quantity > 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_bundles_updated_at ON product_bundles`);
    await queryRunner.dropTable('bundle_items', true);
    await queryRunner.dropTable('product_bundles', true);
  }
}
