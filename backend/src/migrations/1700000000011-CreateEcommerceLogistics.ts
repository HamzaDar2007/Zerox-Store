import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceLogistics1700000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── warehouses ──
    await queryRunner.query(`
      CREATE TABLE warehouses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        line1 TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // ── inventory (uses generated column for qty_available) ──
    await queryRunner.query(`
      CREATE TABLE inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        qty_on_hand INT NOT NULL DEFAULT 0 CHECK (qty_on_hand >= 0),
        qty_reserved INT NOT NULL DEFAULT 0 CHECK (qty_reserved >= 0),
        qty_available INT GENERATED ALWAYS AS (qty_on_hand - qty_reserved) STORED,
        low_stock_threshold INT DEFAULT 5,
        UNIQUE (warehouse_id, variant_id)
      )
    `);

    // ── shipping_zones ──
    await queryRunner.query(`
      CREATE TABLE shipping_zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // ── shipping_zone_countries ──
    await queryRunner.query(`
      CREATE TABLE shipping_zone_countries (
        zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
        country CHAR(2) NOT NULL,
        PRIMARY KEY (zone_id, country)
      )
    `);

    // ── shipping_methods ──
    await queryRunner.query(`
      CREATE TABLE shipping_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        carrier VARCHAR(200),
        estimated_days_min INT,
        estimated_days_max INT,
        base_rate NUMERIC(14,4) NOT NULL,
        per_kg_rate NUMERIC(14,4) NOT NULL,
        free_threshold NUMERIC(14,4),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // ── shipments ──
    await queryRunner.query(`
      CREATE TABLE shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        warehouse_id UUID NOT NULL REFERENCES warehouses(id),
        shipping_method_id UUID NOT NULL REFERENCES shipping_methods(id),
        tracking_number VARCHAR(200),
        carrier VARCHAR(200),
        status VARCHAR(30) NOT NULL CHECK (status IN ('preparing', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
        dispatched_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ
      )
    `);

    // ── shipment_events ──
    await queryRunner.query(`
      CREATE TABLE shipment_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
        status VARCHAR(30) NOT NULL,
        location VARCHAR(300),
        description TEXT,
        occurred_at TIMESTAMPTZ NOT NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS shipment_events CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS shipments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS shipping_methods CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS shipping_zone_countries CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS shipping_zones CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS inventory CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS warehouses CASCADE`);
  }
}
