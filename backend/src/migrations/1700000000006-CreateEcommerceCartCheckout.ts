import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceCartCheckout1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── coupons ──
    await queryRunner.query(`
      CREATE TABLE coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
        discount_value NUMERIC(14,4) NOT NULL,
        max_discount NUMERIC(14,4),
        min_order_value NUMERIC(14,4),
        usage_limit INT,
        per_user_limit INT,
        is_active BOOLEAN DEFAULT TRUE,
        starts_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ
      )
    `);

    // ── coupon_scopes ──
    await queryRunner.query(`
      CREATE TABLE coupon_scopes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('global', 'user', 'product', 'category')),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        CONSTRAINT coupon_scope_exclusive CHECK (
          (scope_type = 'global' AND user_id IS NULL AND product_id IS NULL AND category_id IS NULL)
          OR (scope_type = 'user' AND user_id IS NOT NULL AND product_id IS NULL AND category_id IS NULL)
          OR (scope_type = 'product' AND product_id IS NOT NULL AND user_id IS NULL AND category_id IS NULL)
          OR (scope_type = 'category' AND category_id IS NOT NULL AND user_id IS NULL AND product_id IS NULL)
        )
      )
    `);

    // ── wishlists ──
    await queryRunner.query(`
      CREATE TABLE wishlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(200) DEFAULT 'My Wishlist',
        is_public BOOLEAN DEFAULT FALSE
      )
    `);

    // ── wishlist_items ──
    await queryRunner.query(`
      CREATE TABLE wishlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        UNIQUE (wishlist_id, variant_id)
      )
    `);

    // ── carts ──
    await queryRunner.query(`
      CREATE TABLE carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(200),
        currency CHAR(3) DEFAULT 'USD',
        coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
        CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      )
    `);

    // ── cart_items ──
    await queryRunner.query(`
      CREATE TABLE cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity INT NOT NULL CHECK (quantity > 0),
        unit_price NUMERIC(14,4) NOT NULL,
        UNIQUE (cart_id, variant_id)
      )
    `);

    // ── flash_sales ──
    await queryRunner.query(`
      CREATE TABLE flash_sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(300) NOT NULL,
        starts_at TIMESTAMPTZ NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        CHECK (ends_at > starts_at)
      )
    `);

    // ── flash_sale_items ──
    await queryRunner.query(`
      CREATE TABLE flash_sale_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        flash_sale_id UUID NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        sale_price NUMERIC(14,4) NOT NULL,
        quantity_limit INT,
        quantity_sold INT,
        UNIQUE (flash_sale_id, variant_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS flash_sale_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS flash_sales CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS cart_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS carts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS wishlist_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS wishlists CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS coupon_scopes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS coupons CASCADE`);
  }
}
