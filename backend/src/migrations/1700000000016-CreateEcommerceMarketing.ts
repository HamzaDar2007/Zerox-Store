import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceMarketing1700000000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // vouchers
    await queryRunner.createTable(
      new Table({
        name: 'vouchers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '50', isNullable: false, isUnique: true },
          { name: 'name', type: 'varchar', length: '200', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'seller_id', type: 'uuid', isNullable: true },
          { name: 'type', type: 'voucher_type_enum', isNullable: false },
          { name: 'discount_value', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'min_order_amount', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'max_discount', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'applicable_to', type: 'voucher_scope_enum', default: `'all'` },
          { name: 'applicable_ids', type: 'jsonb', isNullable: true },
          { name: 'total_limit', type: 'integer', isNullable: true },
          { name: 'per_user_limit', type: 'integer', default: 1 },
          { name: 'used_count', type: 'integer', default: 0 },
          { name: 'first_order_only', type: 'boolean', default: false },
          { name: 'stackable', type: 'boolean', default: false },
          { name: 'display_on_store', type: 'boolean', default: true },
          { name: 'currency_code', type: 'varchar', length: '3', default: `'PKR'` },
          { name: 'starts_at', type: 'timestamptz', isNullable: false },
          { name: 'expires_at', type: 'timestamptz', isNullable: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // voucher_conditions
    await queryRunner.createTable(
      new Table({
        name: 'voucher_conditions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'voucher_id', type: 'uuid', isNullable: false },
          { name: 'condition_type', type: 'varchar', length: '50', isNullable: false },
          { name: 'condition_value', type: 'jsonb', isNullable: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['voucher_id'], referencedTableName: 'vouchers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // voucher_products (with CHECK constraint via raw SQL)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS voucher_products (
          id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          voucher_id          UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
          product_id          UUID REFERENCES products(id) ON DELETE CASCADE,
          category_id         UUID REFERENCES categories(id) ON DELETE CASCADE,
          brand_id            UUID REFERENCES brands(id) ON DELETE CASCADE,
          CHECK (
              (product_id IS NOT NULL AND category_id IS NULL AND brand_id IS NULL) OR
              (product_id IS NULL AND category_id IS NOT NULL AND brand_id IS NULL) OR
              (product_id IS NULL AND category_id IS NULL AND brand_id IS NOT NULL)
          )
      )
    `);

    // voucher_usages
    await queryRunner.createTable(
      new Table({
        name: 'voucher_usages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'voucher_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'discount_applied', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'used_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['voucher_id'], referencedTableName: 'vouchers', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // campaigns
    await queryRunner.createTable(
      new Table({
        name: 'campaigns',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '200', isNullable: false },
          { name: 'slug', type: 'varchar', length: '200', isNullable: true, isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'type', type: 'campaign_type_enum', default: `'seasonal'` },
          { name: 'banner_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'mobile_banner_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'thumbnail_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'starts_at', type: 'timestamptz', isNullable: false },
          { name: 'ends_at', type: 'timestamptz', isNullable: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'is_featured', type: 'boolean', default: false },
          { name: 'meta_title', type: 'varchar', length: '255', isNullable: true },
          { name: 'meta_description', type: 'varchar', length: '500', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // campaign_products
    await queryRunner.createTable(
      new Table({
        name: 'campaign_products',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'campaign_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'sale_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'stock_limit', type: 'integer', isNullable: true },
          { name: 'sold_count', type: 'integer', default: 0 },
          { name: 'sort_order', type: 'integer', default: 0 },
        ],
        uniques: [new TableUnique({ columnNames: ['campaign_id', 'product_id'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['campaign_id'], referencedTableName: 'campaigns', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // flash_sales
    await queryRunner.createTable(
      new Table({
        name: 'flash_sales',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '200', isNullable: false },
          { name: 'slug', type: 'varchar', length: '200', isNullable: true, isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'banner_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'starts_at', type: 'timestamptz', isNullable: false },
          { name: 'ends_at', type: 'timestamptz', isNullable: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // flash_sale_products
    await queryRunner.createTable(
      new Table({
        name: 'flash_sale_products',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'flash_sale_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'sale_price', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'original_price', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'stock_limit', type: 'integer', isNullable: false },
          { name: 'sold_count', type: 'integer', default: 0 },
          { name: 'per_user_limit', type: 'integer', default: 1 },
          { name: 'sort_order', type: 'integer', default: 0 },
        ],
        uniques: [new TableUnique({ columnNames: ['flash_sale_id', 'product_id', 'variant_id'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['flash_sale_id'], referencedTableName: 'flash_sales', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_vouchers_seller ON vouchers(seller_id) WHERE seller_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(starts_at, expires_at) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_vouchers_scope ON vouchers(applicable_to) WHERE is_active = TRUE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_voucher_conditions_voucher ON voucher_conditions(voucher_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_voucher_products_voucher ON voucher_products(voucher_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_voucher_products_product ON voucher_products(product_id) WHERE product_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_voucher_products_category ON voucher_products(category_id) WHERE category_id IS NOT NULL`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_voucher_usages_voucher_user ON voucher_usages(voucher_id, user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_voucher_usages_order ON voucher_usages(order_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(starts_at, ends_at) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug) WHERE slug IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_campaigns_featured ON campaigns(starts_at) WHERE is_featured = TRUE AND is_active = TRUE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_campaign_products_campaign ON campaign_products(campaign_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_campaign_products_product ON campaign_products(product_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_flash_sales_active ON flash_sales(starts_at, ends_at) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_flash_sale_products_sale ON flash_sale_products(flash_sale_id, sort_order)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_flash_sale_products_product ON flash_sale_products(product_id)`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_vouchers_updated_at BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_flash_sales_updated_at BEFORE UPDATE ON flash_sales FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_voucher_discount_value') THEN
          ALTER TABLE vouchers ADD CONSTRAINT chk_voucher_discount_value CHECK (discount_value > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_voucher_dates') THEN
          ALTER TABLE vouchers ADD CONSTRAINT chk_voucher_dates CHECK (expires_at > starts_at);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_voucher_percentage') THEN
          ALTER TABLE vouchers ADD CONSTRAINT chk_voucher_percentage CHECK (type != 'percentage' OR (discount_value > 0 AND discount_value <= 100));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_voucher_usage') THEN
          ALTER TABLE vouchers ADD CONSTRAINT chk_voucher_usage CHECK (used_count >= 0 AND (total_limit IS NULL OR used_count <= total_limit));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_voucher_per_user') THEN
          ALTER TABLE vouchers ADD CONSTRAINT chk_voucher_per_user CHECK (per_user_limit >= 1);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_campaign_dates') THEN
          ALTER TABLE campaigns ADD CONSTRAINT chk_campaign_dates CHECK (ends_at > starts_at);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_campaign_discount') THEN
          ALTER TABLE campaigns ADD CONSTRAINT chk_campaign_discount CHECK (discount_percentage IS NULL OR (discount_percentage > 0 AND discount_percentage <= 100));
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_flash_sale_dates') THEN
          ALTER TABLE flash_sales ADD CONSTRAINT chk_flash_sale_dates CHECK (ends_at > starts_at);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_flash_sale_price_positive') THEN
          ALTER TABLE flash_sale_products ADD CONSTRAINT chk_flash_sale_price_positive CHECK (sale_price > 0 AND original_price > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_flash_sale_stock') THEN
          ALTER TABLE flash_sale_products ADD CONSTRAINT chk_flash_sale_stock CHECK (stock_limit > 0 AND sold_count >= 0 AND sold_count <= stock_limit);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_flash_sales_updated_at ON flash_sales`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_vouchers_updated_at ON vouchers`);
    await queryRunner.dropTable('flash_sale_products', true);
    await queryRunner.dropTable('flash_sales', true);
    await queryRunner.dropTable('campaign_products', true);
    await queryRunner.dropTable('campaigns', true);
    await queryRunner.dropTable('voucher_usages', true);
    await queryRunner.query(`DROP TABLE IF EXISTS voucher_products`);
    await queryRunner.dropTable('voucher_conditions', true);
    await queryRunner.dropTable('vouchers', true);
  }
}
