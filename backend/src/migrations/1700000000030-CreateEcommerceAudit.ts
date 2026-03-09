import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceAudit1700000000030 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // audit_logs
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'action', type: 'audit_action_enum', isNullable: false },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          { name: 'entity_id', type: 'uuid', isNullable: true },
          { name: 'old_values', type: 'jsonb', isNullable: true },
          { name: 'new_values', type: 'jsonb', isNullable: true },
          { name: 'changed_fields', type: 'text[]', isNullable: true },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'session_id', type: 'uuid', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'created_at',
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

    // user_activity_logs
    await queryRunner.createTable(
      new Table({
        name: 'user_activity_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'activity_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          { name: 'entity_id', type: 'uuid', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          {
            name: 'device_type',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'referrer_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'page_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
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
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON user_activity_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON user_activity_logs(activity_type, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON user_activity_logs(entity_type, entity_id) WHERE entity_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON user_activity_logs(created_at)`,
    );

    // Generic audit trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_audit_trigger()
      RETURNS TRIGGER AS $$
      DECLARE
          v_old JSONB := NULL;
          v_new JSONB := NULL;
          v_action audit_action_enum;
          v_changed TEXT[];
          v_key TEXT;
      BEGIN
          IF TG_OP = 'DELETE' THEN
              v_old := to_jsonb(OLD);
              v_action := 'delete';
          ELSIF TG_OP = 'INSERT' THEN
              v_new := to_jsonb(NEW);
              v_action := 'create';
          ELSIF TG_OP = 'UPDATE' THEN
              v_old := to_jsonb(OLD);
              v_new := to_jsonb(NEW);
              v_action := 'update';
              FOR v_key IN SELECT jsonb_object_keys(v_new)
              LOOP
                  IF v_key NOT IN ('updated_at', 'created_at') AND
                     (v_old->v_key IS DISTINCT FROM v_new->v_key) THEN
                      v_changed := array_append(v_changed, v_key);
                  END IF;
              END LOOP;
          END IF;

          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, changed_fields, created_at)
          VALUES (
              fn_current_user_id(),
              v_action,
              TG_TABLE_NAME,
              COALESCE((v_new->>'id')::UUID, (v_old->>'id')::UUID),
              v_old,
              v_new,
              v_changed,
              NOW()
          );

          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_audit_trigger() CASCADE`,
    );
    await queryRunner.dropTable('user_activity_logs', true);
    await queryRunner.dropTable('audit_logs', true);
  }
}
