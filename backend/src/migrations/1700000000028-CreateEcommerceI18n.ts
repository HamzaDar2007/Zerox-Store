import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceI18n1700000000028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // languages
    await queryRunner.createTable(
      new Table({
        name: 'languages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '5', isNullable: false, isUnique: true },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'native_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'direction', type: 'text_direction_enum', default: `'ltr'` },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // translations
    await queryRunner.createTable(
      new Table({
        name: 'translations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'language_id', type: 'uuid', isNullable: false },
          { name: 'entity_type', type: 'varchar', length: '50', isNullable: false },
          { name: 'entity_id', type: 'uuid', isNullable: false },
          { name: 'field_name', type: 'varchar', length: '100', isNullable: false },
          { name: 'translated_value', type: 'text', isNullable: false },
          { name: 'is_auto_translated', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        uniques: [new TableUnique({ columnNames: ['language_id', 'entity_type', 'entity_id', 'field_name'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['language_id'], referencedTableName: 'languages', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // currencies
    await queryRunner.createTable(
      new Table({
        name: 'currencies',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '3', isNullable: false, isUnique: true },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'symbol', type: 'varchar', length: '10', isNullable: false },
          { name: 'symbol_position', type: 'varchar', length: '10', default: `'before'` },
          { name: 'decimal_places', type: 'smallint', default: 2 },
          { name: 'thousands_separator', type: 'varchar', length: '3', default: `','` },
          { name: 'decimal_separator', type: 'varchar', length: '3', default: `'.'` },
          { name: 'exchange_rate', type: 'decimal', precision: 12, scale: 6, isNullable: false, default: 1.000000 },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // currency_rate_history
    await queryRunner.createTable(
      new Table({
        name: 'currency_rate_history',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'currency_id', type: 'uuid', isNullable: false },
          { name: 'rate', type: 'decimal', precision: 12, scale: 6, isNullable: false },
          { name: 'source', type: 'varchar', length: '100', isNullable: true },
          { name: 'recorded_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['currency_id'], referencedTableName: 'currencies', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_translations_entity ON translations(entity_type, entity_id, language_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_id, entity_type)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code) WHERE is_active = TRUE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_currency_rate_history ON currency_rate_history(currency_id, recorded_at DESC)`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_translations_updated_at BEFORE UPDATE ON translations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Add FKs to users for preferences
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_preferred_language') THEN
          ALTER TABLE users ADD CONSTRAINT fk_users_preferred_language FOREIGN KEY (preferred_language_id) REFERENCES languages(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_preferred_currency') THEN
          ALTER TABLE users ADD CONSTRAINT fk_users_preferred_currency FOREIGN KEY (preferred_currency_id) REFERENCES currencies(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_currency_rate_positive') THEN
          ALTER TABLE currencies ADD CONSTRAINT chk_currency_rate_positive CHECK (exchange_rate > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_currency_decimals') THEN
          ALTER TABLE currencies ADD CONSTRAINT chk_currency_decimals CHECK (decimal_places >= 0 AND decimal_places <= 6);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_preferred_currency`);
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_preferred_language`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_translations_updated_at ON translations`);
    await queryRunner.dropTable('currency_rate_history', true);
    await queryRunner.dropTable('currencies', true);
    await queryRunner.dropTable('translations', true);
    await queryRunner.dropTable('languages', true);
  }
}
