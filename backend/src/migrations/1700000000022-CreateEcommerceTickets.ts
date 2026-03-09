import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceTickets1700000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ticket_categories
    await queryRunner.createTable(
      new Table({
        name: 'ticket_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'parent_id', type: 'uuid', isNullable: true },
          { name: 'sla_response_hours', type: 'integer', default: 24 },
          { name: 'sla_resolution_hours', type: 'integer', default: 72 },
          {
            name: 'priority_default',
            type: 'ticket_priority_enum',
            default: `'medium'`,
          },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['parent_id'],
            referencedTableName: 'ticket_categories',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // tickets
    await queryRunner.createTable(
      new Table({
        name: 'tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'ticket_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
            default: 'fn_generate_ticket_number()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'category_id', type: 'uuid', isNullable: false },
          {
            name: 'subject',
            type: 'varchar',
            length: '300',
            isNullable: false,
          },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'status', type: 'ticket_status_enum', default: `'open'` },
          {
            name: 'priority',
            type: 'ticket_priority_enum',
            default: `'medium'`,
          },
          { name: 'assigned_to', type: 'uuid', isNullable: true },
          { name: 'assigned_at', type: 'timestamptz', isNullable: true },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'product_id', type: 'uuid', isNullable: true },
          {
            name: 'related_entity_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          { name: 'related_entity_id', type: 'uuid', isNullable: true },
          {
            name: 'sla_response_deadline',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'sla_resolution_deadline',
            type: 'timestamptz',
            isNullable: true,
          },
          { name: 'first_response_at', type: 'timestamptz', isNullable: true },
          { name: 'sla_response_breached', type: 'boolean', default: false },
          { name: 'sla_resolution_breached', type: 'boolean', default: false },
          { name: 'resolved_at', type: 'timestamptz', isNullable: true },
          { name: 'closed_at', type: 'timestamptz', isNullable: true },
          { name: 'resolution_note', type: 'text', isNullable: true },
          { name: 'satisfaction_rating', type: 'smallint', isNullable: true },
          { name: 'satisfaction_comment', type: 'text', isNullable: true },
          { name: 'tags', type: 'text[]', isNullable: true },
          { name: 'last_reply_at', type: 'timestamptz', isNullable: true },
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
          new TableForeignKey({
            columnNames: ['category_id'],
            referencedTableName: 'ticket_categories',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['assigned_to'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['order_id'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // ticket_messages
    await queryRunner.createTable(
      new Table({
        name: 'ticket_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'ticket_id', type: 'uuid', isNullable: false },
          { name: 'sender_id', type: 'uuid', isNullable: false },
          { name: 'message', type: 'text', isNullable: false },
          { name: 'is_internal_note', type: 'boolean', default: false },
          { name: 'attachments', type: 'jsonb', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['ticket_id'],
            referencedTableName: 'tickets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['sender_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id, status, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to, status) WHERE status NOT IN ('resolved', 'closed')`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status, priority, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id) WHERE order_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_sla_response ON tickets(sla_response_deadline) WHERE status = 'open' AND first_response_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_sla_resolution ON tickets(sla_resolution_deadline) WHERE status NOT IN ('resolved', 'closed')`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_search ON tickets USING GIN (to_tsvector('english', subject))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_tickets_tags ON tickets USING GIN (tags) WHERE tags IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ticket_messages_internal ON ticket_messages(ticket_id) WHERE is_internal_note = FALSE`,
    );

    // Triggers
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ticket_satisfaction') THEN
          ALTER TABLE tickets ADD CONSTRAINT chk_ticket_satisfaction CHECK (satisfaction_rating IS NULL OR (satisfaction_rating >= 1 AND satisfaction_rating <= 5));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ticket_sla_hours') THEN
          ALTER TABLE ticket_categories ADD CONSTRAINT chk_ticket_sla_hours CHECK (sla_response_hours > 0 AND sla_resolution_hours > 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets`,
    );
    await queryRunner.dropTable('ticket_messages', true);
    await queryRunner.dropTable('tickets', true);
    await queryRunner.dropTable('ticket_categories', true);
  }
}
