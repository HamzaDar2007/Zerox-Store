import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceProducts1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── products ──
    await queryRunner.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
        name VARCHAR(300),
        slug VARCHAR(300) UNIQUE NOT NULL,
        short_desc TEXT,
        full_desc TEXT,
        base_price NUMERIC(14,4) NOT NULL,
        currency CHAR(3) DEFAULT 'USD',
        is_active BOOLEAN,
        is_digital BOOLEAN,
        requires_shipping BOOLEAN,
        tax_class VARCHAR(50)
      )
    `);

    // ── attribute_keys ──
    await queryRunner.query(`
      CREATE TABLE attribute_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200),
        slug VARCHAR(200) UNIQUE NOT NULL,
        input_type VARCHAR(30) NOT NULL CHECK (input_type IN ('select', 'swatch', 'text', 'boolean'))
      )
    `);

    // ── attribute_values ──
    await queryRunner.query(`
      CREATE TABLE attribute_values (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        attribute_key_id UUID NOT NULL REFERENCES attribute_keys(id) ON DELETE CASCADE,
        value VARCHAR(200) NOT NULL,
        display_value VARCHAR(200),
        sort_order INT DEFAULT 0,
        UNIQUE (attribute_key_id, value)
      )
    `);

    // ── product_variants ──
    await queryRunner.query(`
      CREATE TABLE product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku VARCHAR(200) UNIQUE NOT NULL,
        price NUMERIC(14,4),
        weight_grams INT,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // ── variant_attribute_values ──
    await queryRunner.query(`
      CREATE TABLE variant_attribute_values (
        variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        attribute_key_id UUID NOT NULL REFERENCES attribute_keys(id) ON DELETE CASCADE,
        attribute_value_id UUID NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
        PRIMARY KEY (variant_id, attribute_key_id)
      )
    `);

    // ── product_images ──
    await queryRunner.query(`
      CREATE TABLE product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
        url TEXT NOT NULL,
        alt_text TEXT,
        sort_order INT,
        is_primary BOOLEAN
      )
    `);

    // ── product_categories ──
    await queryRunner.query(`
      CREATE TABLE product_categories (
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, category_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_images CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS variant_attribute_values CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS product_variants CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS attribute_values CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS attribute_keys CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS products CASCADE`);
  }
}
