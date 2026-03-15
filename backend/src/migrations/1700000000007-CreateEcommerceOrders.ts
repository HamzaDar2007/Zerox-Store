import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceOrders1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── orders ──
    await queryRunner.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
        status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
        subtotal NUMERIC(14,4) NOT NULL,
        discount_amount NUMERIC(14,4) NOT NULL,
        shipping_amount NUMERIC(14,4) NOT NULL,
        tax_amount NUMERIC(14,4) NOT NULL,
        total_amount NUMERIC(14,4) NOT NULL,
        shipping_line1 TEXT,
        shipping_line2 TEXT,
        shipping_city VARCHAR(100),
        shipping_state VARCHAR(100),
        shipping_postal_code VARCHAR(20),
        shipping_country CHAR(2)
      )
    `);

    // ── order_items ──
    await queryRunner.query(`
      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES product_variants(id),
        store_id UUID NOT NULL REFERENCES stores(id),
        sku_snapshot VARCHAR(200) NOT NULL,
        name_snapshot VARCHAR(300) NOT NULL,
        unit_price NUMERIC(14,4) NOT NULL,
        discount_amount NUMERIC(14,4) NOT NULL,
        tax_amount NUMERIC(14,4) NOT NULL,
        total_amount NUMERIC(14,4) NOT NULL,
        flash_sale_id UUID REFERENCES flash_sales(id) ON DELETE SET NULL
      )
    `);

    // ── payments ──
    await queryRunner.query(`
      CREATE TABLE payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        gateway VARCHAR(50) NOT NULL,
        gateway_tx_id TEXT,
        method VARCHAR(50) NOT NULL,
        amount NUMERIC(14,4) NOT NULL,
        currency CHAR(3) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled')),
        metadata JSONB
      )
    `);

    // ── coupon_usages ──
    await queryRunner.query(`
      CREATE TABLE coupon_usages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS coupon_usages CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders CASCADE`);
  }
}
