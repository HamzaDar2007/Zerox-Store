import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceShipping1700000000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // shipping_methods
    await queryRunner.createTable(
      new Table({
        name: 'shipping_methods',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'type',
            type: 'shipping_method_type_enum',
            default: `'standard'`,
          },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'sort_order', type: 'integer', default: 0 },
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

    // shipping_zones
    await queryRunner.createTable(
      new Table({
        name: 'shipping_zones',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'countries',
            type: 'text[]',
            isNullable: false,
            default: `ARRAY['PK']`,
          },
          { name: 'states', type: 'text[]', isNullable: true },
          { name: 'cities', type: 'text[]', isNullable: true },
          { name: 'postal_code_ranges', type: 'jsonb', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
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

    // shipping_rates
    await queryRunner.createTable(
      new Table({
        name: 'shipping_rates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'shipping_zone_id', type: 'uuid', isNullable: false },
          { name: 'shipping_method_id', type: 'uuid', isNullable: false },
          { name: 'seller_id', type: 'uuid', isNullable: true },
          {
            name: 'min_weight',
            type: 'decimal',
            precision: 10,
            scale: 3,
            default: 0,
          },
          {
            name: 'max_weight',
            type: 'decimal',
            precision: 10,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'min_order_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'max_order_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'base_rate',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'per_kg_rate',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'per_item_rate',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'free_shipping_threshold',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          { name: 'estimated_days_min', type: 'integer', isNullable: true },
          { name: 'estimated_days_max', type: 'integer', isNullable: true },
          {
            name: 'currency_code',
            type: 'varchar',
            length: '3',
            default: `'PKR'`,
          },
          { name: 'is_active', type: 'boolean', default: true },
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
            columnNames: ['shipping_zone_id'],
            referencedTableName: 'shipping_zones',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['shipping_method_id'],
            referencedTableName: 'shipping_methods',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
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

    // shipping_carriers
    await queryRunner.createTable(
      new Table({
        name: 'shipping_carriers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'website_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'tracking_url_template',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'api_endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'api_key_encrypted', type: 'text', isNullable: true },
          { name: 'supports_cod', type: 'boolean', default: false },
          { name: 'supports_insurance', type: 'boolean', default: false },
          { name: 'supports_signature', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
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

    // delivery_slots
    await queryRunner.createTable(
      new Table({
        name: 'delivery_slots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'shipping_zone_id', type: 'uuid', isNullable: true },
          { name: 'shipping_method_id', type: 'uuid', isNullable: true },
          { name: 'day_of_week', type: 'smallint', isNullable: true },
          { name: 'start_time', type: 'time', isNullable: false },
          { name: 'end_time', type: 'time', isNullable: false },
          {
            name: 'max_orders',
            type: 'integer',
            isNullable: false,
            default: 50,
          },
          { name: 'current_orders', type: 'integer', default: 0 },
          { name: 'cutoff_time', type: 'time', isNullable: true },
          {
            name: 'surcharge',
            type: 'decimal',
            precision: 8,
            scale: 2,
            default: 0.0,
          },
          { name: 'is_active', type: 'boolean', default: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['shipping_zone_id'],
            referencedTableName: 'shipping_zones',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['shipping_method_id'],
            referencedTableName: 'shipping_methods',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone_method ON shipping_rates(shipping_zone_id, shipping_method_id) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_shipping_rates_seller ON shipping_rates(seller_id) WHERE seller_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_shipping_zones_countries ON shipping_zones USING GIN (countries)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_shipping_zones_cities ON shipping_zones USING GIN (cities) WHERE cities IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_shipping_carriers_code ON shipping_carriers(code) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_delivery_slots_zone ON delivery_slots(shipping_zone_id, day_of_week) WHERE is_active = TRUE`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shipping_rate_positive') THEN
          ALTER TABLE shipping_rates ADD CONSTRAINT chk_shipping_rate_positive CHECK (base_rate >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shipping_weight_range') THEN
          ALTER TABLE shipping_rates ADD CONSTRAINT chk_shipping_weight_range CHECK (max_weight IS NULL OR max_weight > min_weight);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shipping_days') THEN
          ALTER TABLE shipping_rates ADD CONSTRAINT chk_shipping_days CHECK (estimated_days_min IS NULL OR estimated_days_min > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_delivery_slot_time') THEN
          ALTER TABLE delivery_slots ADD CONSTRAINT chk_delivery_slot_time CHECK (end_time > start_time);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_delivery_slot_day') THEN
          ALTER TABLE delivery_slots ADD CONSTRAINT chk_delivery_slot_day CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_delivery_slot_orders') THEN
          ALTER TABLE delivery_slots ADD CONSTRAINT chk_delivery_slot_orders CHECK (current_orders >= 0 AND current_orders <= max_orders);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('delivery_slots', true);
    await queryRunner.dropTable('shipping_carriers', true);
    await queryRunner.dropTable('shipping_rates', true);
    await queryRunner.dropTable('shipping_zones', true);
    await queryRunner.dropTable('shipping_methods', true);
  }
}
