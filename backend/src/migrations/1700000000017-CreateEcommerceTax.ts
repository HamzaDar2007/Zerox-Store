import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceTax1700000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // tax_classes
    await queryRunner.createTable(
      new Table({
        name: 'tax_classes',
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
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_default', type: 'boolean', default: false },
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

    // tax_zones
    await queryRunner.createTable(
      new Table({
        name: 'tax_zones',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'country_code',
            type: 'varchar',
            length: '3',
            isNullable: false,
          },
          {
            name: 'state_code',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          {
            name: 'postal_code_pattern',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
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

    // tax_rates
    await queryRunner.createTable(
      new Table({
        name: 'tax_rates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'tax_zone_id', type: 'uuid', isNullable: false },
          { name: 'tax_class_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'rate',
            type: 'decimal',
            precision: 6,
            scale: 3,
            isNullable: false,
          },
          { name: 'is_compound', type: 'boolean', default: false },
          { name: 'priority', type: 'integer', default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'effective_from', type: 'date', isNullable: false },
          { name: 'effective_until', type: 'date', isNullable: true },
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
            columnNames: ['tax_zone_id'],
            referencedTableName: 'tax_zones',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['tax_class_id'],
            referencedTableName: 'tax_classes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // order_tax_lines
    await queryRunner.createTable(
      new Table({
        name: 'order_tax_lines',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'order_item_id', type: 'uuid', isNullable: true },
          { name: 'tax_rate_id', type: 'uuid', isNullable: true },
          {
            name: 'tax_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'rate_applied',
            type: 'decimal',
            precision: 6,
            scale: 3,
            isNullable: false,
          },
          {
            name: 'taxable_amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['order_id'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['order_item_id'],
            referencedTableName: 'order_items',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['tax_rate_id'],
            referencedTableName: 'tax_rates',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tax_rates_zone_class ON tax_rates(tax_zone_id, tax_class_id) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tax_rates_effective ON tax_rates(effective_from, effective_until)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_order_tax_lines_order ON order_tax_lines(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_order_tax_lines_item ON order_tax_lines(order_item_id) WHERE order_item_id IS NOT NULL`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tax_rate_range') THEN
          ALTER TABLE tax_rates ADD CONSTRAINT chk_tax_rate_range CHECK (rate >= 0 AND rate <= 100);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tax_rate_dates') THEN
          ALTER TABLE tax_rates ADD CONSTRAINT chk_tax_rate_dates CHECK (effective_until IS NULL OR effective_until > effective_from);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tax_amount_non_negative') THEN
          ALTER TABLE order_tax_lines ADD CONSTRAINT chk_tax_amount_non_negative CHECK (tax_amount >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_tax_lines', true);
    await queryRunner.dropTable('tax_rates', true);
    await queryRunner.dropTable('tax_zones', true);
    await queryRunner.dropTable('tax_classes', true);
  }
}
