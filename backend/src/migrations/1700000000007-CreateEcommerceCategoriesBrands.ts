import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableUnique,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceCategoriesBrands1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // categories
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'parent_id', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'icon_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'banner_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'meta_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'meta_description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'commission_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'is_featured', type: 'boolean', default: false },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'depth', type: 'smallint', default: 0 },
          { name: 'path', type: 'text', isNullable: true },
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
            columnNames: ['parent_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
      true,
    );

    // brands
    await queryRunner.createTable(
      new Table({
        name: 'brands',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'website_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'country_of_origin',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'is_featured', type: 'boolean', default: false },
          { name: 'sort_order', type: 'integer', default: 0 },
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
      }),
      true,
    );

    // attribute_groups
    await queryRunner.createTable(
      new Table({
        name: 'attribute_groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
      }),
      true,
    );

    // attributes
    await queryRunner.createTable(
      new Table({
        name: 'attributes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'attribute_group_id', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'type',
            type: 'attribute_type_enum',
            isNullable: false,
            default: `'text'`,
          },
          { name: 'unit', type: 'varchar', length: '30', isNullable: true },
          { name: 'is_filterable', type: 'boolean', default: false },
          { name: 'is_required', type: 'boolean', default: false },
          { name: 'is_variant_attribute', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['attribute_group_id'],
            referencedTableName: 'attribute_groups',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
      true,
    );

    // attribute_options
    await queryRunner.createTable(
      new Table({
        name: 'attribute_options',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'attribute_id', type: 'uuid', isNullable: false },
          { name: 'value', type: 'varchar', length: '200', isNullable: false },
          { name: 'color_hex', type: 'varchar', length: '7', isNullable: true },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
        ],
        uniques: [new TableUnique({ columnNames: ['attribute_id', 'value'] })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['attribute_id'],
            referencedTableName: 'attributes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // category_attributes
    await queryRunner.createTable(
      new Table({
        name: 'category_attributes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'category_id', type: 'uuid', isNullable: false },
          { name: 'attribute_id', type: 'uuid', isNullable: false },
          { name: 'is_required', type: 'boolean', default: false },
          { name: 'sort_order', type: 'integer', default: 0 },
        ],
        uniques: [
          new TableUnique({ columnNames: ['category_id', 'attribute_id'] }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['attribute_id'],
            referencedTableName: 'attributes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // brand_categories
    await queryRunner.createTable(
      new Table({
        name: 'brand_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'brand_id', type: 'uuid', isNullable: false },
          { name: 'category_id', type: 'uuid', isNullable: false },
        ],
        uniques: [
          new TableUnique({ columnNames: ['brand_id', 'category_id'] }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['brand_id'],
            referencedTableName: 'brands',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, sort_order) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured) WHERE is_featured = TRUE AND is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_categories_name_trgm ON categories USING GIN (name gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_categories_depth ON categories(depth, sort_order)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(id) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON brands USING GIN (name gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brands_featured ON brands(sort_order) WHERE is_featured = TRUE AND is_active = TRUE`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_attributes_group ON attributes(attribute_group_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_attributes_slug ON attributes(slug)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_attributes_filterable ON attributes(id) WHERE is_filterable = TRUE AND is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_attributes_variant ON attributes(id) WHERE is_variant_attribute = TRUE`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_attr_options_attribute ON attribute_options(attribute_id, sort_order)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_cat_attributes_category ON category_attributes(category_id, sort_order)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_cat_attributes_attribute ON category_attributes(attribute_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brand_categories_brand ON brand_categories(brand_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brand_categories_category ON brand_categories(category_id)`,
    );

    // Triggers
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_categories_updated_at
        BEFORE UPDATE ON categories
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_brands_updated_at
        BEFORE UPDATE ON brands
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_category_no_self_parent') THEN
          ALTER TABLE categories ADD CONSTRAINT chk_category_no_self_parent CHECK (parent_id IS NULL OR parent_id != id);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_category_commission_range') THEN
          ALTER TABLE categories ADD CONSTRAINT chk_category_commission_range CHECK (commission_rate IS NULL OR (commission_rate >= 0 AND commission_rate <= 50));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_category_depth') THEN
          ALTER TABLE categories ADD CONSTRAINT chk_category_depth CHECK (depth >= 0 AND depth <= 5);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_brands_updated_at ON brands`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories`,
    );
    await queryRunner.dropTable('brand_categories', true);
    await queryRunner.dropTable('category_attributes', true);
    await queryRunner.dropTable('attribute_options', true);
    await queryRunner.dropTable('attributes', true);
    await queryRunner.dropTable('attribute_groups', true);
    await queryRunner.dropTable('brands', true);
    await queryRunner.dropTable('categories', true);
  }
}
