import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceOperations1700000000031 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // import_export_jobs
    await queryRunner.createTable(
      new Table({
        name: 'import_export_jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'import_job_type_enum', isNullable: false },
          { name: 'status', type: 'job_status_enum', default: `'pending'` },
          {
            name: 'source_file_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'result_file_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'total_rows', type: 'integer', default: 0 },
          { name: 'processed_rows', type: 'integer', default: 0 },
          { name: 'success_rows', type: 'integer', default: 0 },
          { name: 'failed_rows', type: 'integer', default: 0 },
          { name: 'error_log', type: 'jsonb', isNullable: true },
          { name: 'error_summary', type: 'text', isNullable: true },
          { name: 'options', type: 'jsonb', isNullable: true },
          { name: 'started_at', type: 'timestamptz', isNullable: true },
          { name: 'completed_at', type: 'timestamptz', isNullable: true },
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
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // bulk_operations
    await queryRunner.createTable(
      new Table({
        name: 'bulk_operations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          {
            name: 'operation_type',
            type: 'bulk_operation_type_enum',
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          { name: 'status', type: 'job_status_enum', default: `'pending'` },
          { name: 'entity_ids', type: 'uuid[]', isNullable: false },
          { name: 'parameters', type: 'jsonb', isNullable: false },
          { name: 'total_count', type: 'integer', isNullable: false },
          { name: 'success_count', type: 'integer', default: 0 },
          { name: 'failure_count', type: 'integer', default: 0 },
          { name: 'error_log', type: 'jsonb', isNullable: true },
          { name: 'started_at', type: 'timestamptz', isNullable: true },
          { name: 'completed_at', type: 'timestamptz', isNullable: true },
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
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_import_jobs_user ON import_export_jobs(user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_export_jobs(status, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_import_jobs_type ON import_export_jobs(type, status)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_bulk_ops_user ON bulk_operations(user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_bulk_ops_status ON bulk_operations(status, created_at DESC)`,
    );

    // Triggers
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_import_jobs_updated_at BEFORE UPDATE ON import_export_jobs FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_bulk_ops_updated_at BEFORE UPDATE ON bulk_operations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_import_rows_non_negative') THEN
          ALTER TABLE import_export_jobs ADD CONSTRAINT chk_import_rows_non_negative CHECK (total_rows >= 0 AND processed_rows >= 0 AND success_rows >= 0 AND failed_rows >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_bulk_counts_non_negative') THEN
          ALTER TABLE bulk_operations ADD CONSTRAINT chk_bulk_counts_non_negative CHECK (total_count > 0 AND success_count >= 0 AND failure_count >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_bulk_ops_updated_at ON bulk_operations`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_import_jobs_updated_at ON import_export_jobs`,
    );
    await queryRunner.dropTable('bulk_operations', true);
    await queryRunner.dropTable('import_export_jobs', true);
  }
}
