import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceSystem1700000000029 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // system_settings
    await queryRunner.createTable(
      new Table({
        name: 'system_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: '"group"', type: 'varchar', length: '50', isNullable: false },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          { name: 'value', type: 'text', isNullable: true },
          {
            name: 'value_type',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: `'string'`,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_public', type: 'boolean', default: false },
          { name: 'is_encrypted', type: 'boolean', default: false },
          { name: 'updated_by', type: 'uuid', isNullable: true },
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
            columnNames: ['updated_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // feature_flags
    await queryRunner.createTable(
      new Table({
        name: 'feature_flags',
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
          { name: 'is_enabled', type: 'boolean', default: false },
          {
            name: 'rollout_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          { name: 'conditions', type: 'jsonb', isNullable: true },
          {
            name: 'enabled_for_roles',
            type: 'user_role_enum[]',
            isNullable: true,
          },
          { name: 'enabled_for_users', type: 'uuid[]', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
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
            columnNames: ['updated_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_settings_group ON system_settings("group")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(key)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_settings_public ON system_settings(key) WHERE is_public = TRUE`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(name) WHERE is_enabled = TRUE`,
    );

    // Triggers
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_rollout_percentage') THEN
          ALTER TABLE feature_flags ADD CONSTRAINT chk_rollout_percentage CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_value_type') THEN
          ALTER TABLE system_settings ADD CONSTRAINT chk_value_type CHECK (value_type IN ('string', 'integer', 'decimal', 'boolean', 'json', 'text', 'url', 'email'));
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_feature_flags_updated_at ON feature_flags`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_settings_updated_at ON system_settings`,
    );
    await queryRunner.dropTable('feature_flags', true);
    await queryRunner.dropTable('system_settings', true);
  }
}
