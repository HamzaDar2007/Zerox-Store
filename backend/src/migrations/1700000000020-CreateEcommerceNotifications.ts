import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceNotifications1700000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // notification_templates
    await queryRunner.createTable(
      new Table({
        name: 'notification_templates',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '100', isNullable: false, isUnique: true },
          { name: 'name', type: 'varchar', length: '200', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'channels', type: 'notification_channel_enum[]', isNullable: false, default: `ARRAY['in_app']::notification_channel_enum[]` },
          { name: 'title_template', type: 'text', isNullable: false },
          { name: 'body_template', type: 'text', isNullable: false },
          { name: 'email_subject_template', type: 'text', isNullable: true },
          { name: 'email_body_template', type: 'text', isNullable: true },
          { name: 'sms_template', type: 'text', isNullable: true },
          { name: 'push_template', type: 'text', isNullable: true },
          { name: 'priority', type: 'notification_priority_enum', default: `'normal'` },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // notifications
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'template_id', type: 'uuid', isNullable: true },
          { name: 'type', type: 'varchar', length: '50', isNullable: false },
          { name: 'title', type: 'varchar', length: '200', isNullable: false },
          { name: 'message', type: 'text', isNullable: false },
          { name: 'action_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'image_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'entity_type', type: 'varchar', length: '50', isNullable: true },
          { name: 'entity_id', type: 'uuid', isNullable: true },
          { name: 'data', type: 'jsonb', isNullable: true },
          { name: 'channel', type: 'notification_channel_enum', default: `'in_app'` },
          { name: 'priority', type: 'notification_priority_enum', default: `'normal'` },
          { name: 'is_read', type: 'boolean', default: false },
          { name: 'read_at', type: 'timestamptz', isNullable: true },
          { name: 'is_dismissed', type: 'boolean', default: false },
          { name: 'expires_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['template_id'], referencedTableName: 'notification_templates', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // notification_preferences
    await queryRunner.createTable(
      new Table({
        name: 'notification_preferences',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'notification_type', type: 'varchar', length: '50', isNullable: false },
          { name: 'channel', type: 'notification_channel_enum', isNullable: false },
          { name: 'is_enabled', type: 'boolean', default: true },
        ],
        uniques: [new TableUnique({ columnNames: ['user_id', 'notification_type', 'channel'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_all ON notifications(user_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id) WHERE entity_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL AND is_read = FALSE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notification_preferences', true);
    await queryRunner.dropTable('notifications', true);
    await queryRunner.dropTable('notification_templates', true);
  }
}
