import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceProducts1700000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // products
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'seller_id', type: 'uuid', isNullable: false },
          { name: 'category_id', type: 'uuid', isNullable: false },
          { name: 'brand_id', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar', length: '300', isNullable: false },
          { name: 'slug', type: 'varchar', length: '300', isNullable: false, isUnique: true },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'short_description', type: 'varchar', length: '500', isNullable: true },
          { name: 'price', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'compare_at_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'cost_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'stock', type: 'integer', isNullable: false, default: 0 },
          { name: 'sku', type: 'varchar', length: '100', isNullable: true, isUnique: true },
          { name: 'weight', type: 'decimal', precision: 10, scale: 3, isNullable: true },
          { name: 'length', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'width', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'height', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'min_order_qty', type: 'integer', default: 1 },
          { name: 'max_order_qty', type: 'integer', isNullable: true },
          { name: 'warranty_type', type: 'warranty_type_enum', default: `'none'` },
          { name: 'warranty_duration', type: 'varchar', length: '50', isNullable: true },
          { name: 'warranty_policy', type: 'text', isNullable: true },
          { name: 'country_of_origin', type: 'varchar', length: '3', isNullable: true },
          { name: 'hs_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'tags', type: 'text[]', isNullable: true },
          { name: 'status', type: 'product_status_enum', isNullable: false, default: `'draft'` },
          { name: 'is_featured', type: 'boolean', default: false },
          { name: 'is_digital', type: 'boolean', default: false },
          { name: 'is_fragile', type: 'boolean', default: false },
          { name: 'is_returnable', type: 'boolean', default: true },
          { name: 'return_window_days', type: 'integer', default: 7 },
          { name: 'requires_shipping', type: 'boolean', default: true },
          { name: 'meta_title', type: 'varchar', length: '255', isNullable: true },
          { name: 'meta_description', type: 'varchar', length: '500', isNullable: true },
          { name: 'search_vector', type: 'tsvector', isNullable: true },
          { name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0.00 },
          { name: 'total_ratings', type: 'integer', default: 0 },
          { name: 'total_reviews', type: 'integer', default: 0 },
          { name: 'total_sold', type: 'integer', default: 0 },
          { name: 'total_questions', type: 'integer', default: 0 },
          { name: 'view_count', type: 'integer', default: 0 },
          { name: 'published_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['category_id'], referencedTableName: 'categories', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['brand_id'], referencedTableName: 'brands', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // product_variants
    await queryRunner.createTable(
      new Table({
        name: 'product_variants',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'sku', type: 'varchar', length: '100', isNullable: true },
          { name: 'barcode', type: 'varchar', length: '50', isNullable: true },
          { name: 'price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'compare_at_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'cost_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'stock', type: 'integer', isNullable: false, default: 0 },
          { name: 'low_stock_threshold', type: 'integer', default: 5 },
          { name: 'weight', type: 'decimal', precision: 10, scale: 3, isNullable: true },
          { name: 'length', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'width', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'height', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'options', type: 'jsonb', isNullable: false, default: `'{}'` },
          { name: 'image_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'position', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // product_images
    await queryRunner.createTable(
      new Table({
        name: 'product_images',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'url', type: 'varchar', length: '500', isNullable: false },
          { name: 'alt_text', type: 'varchar', length: '200', isNullable: true },
          { name: 'is_primary', type: 'boolean', default: false },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
        ],
      }),
      true,
    );

    // product_attributes
    await queryRunner.createTable(
      new Table({
        name: 'product_attributes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'attribute_id', type: 'uuid', isNullable: false },
          { name: 'attribute_option_id', type: 'uuid', isNullable: true },
          { name: 'value_text', type: 'text', isNullable: true },
          { name: 'value_numeric', type: 'decimal', precision: 15, scale: 4, isNullable: true },
        ],
        uniques: [new TableUnique({ columnNames: ['product_id', 'attribute_id'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['attribute_id'], referencedTableName: 'attributes', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['attribute_option_id'], referencedTableName: 'attribute_options', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
        ],
      }),
      true,
    );

    // variant_attribute_values
    await queryRunner.createTable(
      new Table({
        name: 'variant_attribute_values',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'product_variant_id', type: 'uuid', isNullable: false },
          { name: 'attribute_id', type: 'uuid', isNullable: false },
          { name: 'attribute_option_id', type: 'uuid', isNullable: false },
        ],
        uniques: [new TableUnique({ columnNames: ['product_variant_id', 'attribute_id'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['product_variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['attribute_id'], referencedTableName: 'attributes', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['attribute_option_id'], referencedTableName: 'attribute_options', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // price_history
    await queryRunner.createTable(
      new Table({
        name: 'price_history',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'old_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'new_price', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'old_compare_at_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'new_compare_at_price', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'changed_by', type: 'uuid', isNullable: true },
          { name: 'change_reason', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['variant_id'], referencedTableName: 'product_variants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['changed_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // product_questions
    await queryRunner.createTable(
      new Table({
        name: 'product_questions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'question_text', type: 'text', isNullable: false },
          { name: 'is_approved', type: 'boolean', default: false },
          { name: 'approved_at', type: 'timestamptz', isNullable: true },
          { name: 'answer_count', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // product_answers
    await queryRunner.createTable(
      new Table({
        name: 'product_answers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'question_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'seller_id', type: 'uuid', isNullable: true },
          { name: 'answer_text', type: 'text', isNullable: false },
          { name: 'is_seller_answer', type: 'boolean', default: false },
          { name: 'is_approved', type: 'boolean', default: false },
          { name: 'upvote_count', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['question_id'], referencedTableName: 'product_questions', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // Indexes (partial and GIN indexes via raw SQL)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id, status, created_at DESC) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id, status, created_at DESC) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id, status) WHERE deleted_at IS NULL AND brand_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price) WHERE status = 'active' AND deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_rating ON products(avg_rating DESC, total_ratings DESC) WHERE status = 'active' AND deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_sold ON products(total_sold DESC) WHERE status = 'active' AND deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(created_at DESC) WHERE is_featured = TRUE AND status = 'active' AND deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC) WHERE status = 'active' AND deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (search_vector)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (name gin_trgm_ops)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id, position) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_variants_options ON product_variants USING GIN (options)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, sort_order)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id) WHERE is_primary = TRUE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_attrs_product ON product_attributes(product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_attrs_attr ON product_attributes(attribute_id, attribute_option_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_attrs_filter ON product_attributes(attribute_id, value_numeric) WHERE value_numeric IS NOT NULL`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_variant_attrs_variant ON variant_attribute_values(product_variant_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_variant_attrs_attr ON variant_attribute_values(attribute_id, attribute_option_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_price_history_variant ON price_history(variant_id, created_at DESC) WHERE variant_id IS NOT NULL`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_questions_product ON product_questions(product_id, created_at DESC) WHERE is_approved = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_questions_user ON product_questions(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_answers_question ON product_answers(question_id, created_at)`);

    // Triggers
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_variants_updated_at
        BEFORE UPDATE ON product_variants
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price_positive') THEN
          ALTER TABLE products ADD CONSTRAINT chk_products_price_positive CHECK (price > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_compare_price') THEN
          ALTER TABLE products ADD CONSTRAINT chk_products_compare_price CHECK (compare_at_price IS NULL OR compare_at_price >= price);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock_non_negative') THEN
          ALTER TABLE products ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_order_qty') THEN
          ALTER TABLE products ADD CONSTRAINT chk_products_order_qty CHECK (min_order_qty >= 1 AND (max_order_qty IS NULL OR max_order_qty >= min_order_qty));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_return_window') THEN
          ALTER TABLE products ADD CONSTRAINT chk_products_return_window CHECK (return_window_days IS NULL OR return_window_days >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_rating_range') THEN
          ALTER TABLE products ADD CONSTRAINT chk_products_rating_range CHECK (avg_rating >= 0 AND avg_rating <= 5);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_variants_price_positive') THEN
          ALTER TABLE product_variants ADD CONSTRAINT chk_variants_price_positive CHECK (price IS NULL OR price > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_variants_compare_price') THEN
          ALTER TABLE product_variants ADD CONSTRAINT chk_variants_compare_price CHECK (compare_at_price IS NULL OR price IS NULL OR compare_at_price >= price);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_variants_stock_non_negative') THEN
          ALTER TABLE product_variants ADD CONSTRAINT chk_variants_stock_non_negative CHECK (stock >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_variants_updated_at ON product_variants`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_products_updated_at ON products`);
    await queryRunner.dropTable('product_answers', true);
    await queryRunner.dropTable('product_questions', true);
    await queryRunner.dropTable('price_history', true);
    await queryRunner.dropTable('variant_attribute_values', true);
    await queryRunner.dropTable('product_attributes', true);
    await queryRunner.dropTable('product_images', true);
    await queryRunner.dropTable('product_variants', true);
    await queryRunner.dropTable('products', true);
  }
}
