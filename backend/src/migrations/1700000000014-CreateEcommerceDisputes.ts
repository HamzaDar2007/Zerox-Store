import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceDisputes1700000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // disputes
    await queryRunner.createTable(
      new Table({
        name: 'disputes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dispute_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
            default: 'fn_generate_dispute_number()',
          },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'order_item_id', type: 'uuid', isNullable: true },
          { name: 'return_request_id', type: 'uuid', isNullable: true },
          { name: 'opened_by', type: 'uuid', isNullable: false },
          { name: 'against_user_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'dispute_type_enum', isNullable: false },
          {
            name: 'subject',
            type: 'varchar',
            length: '300',
            isNullable: false,
          },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'status', type: 'dispute_status_enum', default: `'open'` },
          {
            name: 'priority',
            type: 'dispute_priority_enum',
            default: `'medium'`,
          },
          {
            name: 'resolution',
            type: 'dispute_resolution_enum',
            isNullable: true,
          },
          {
            name: 'resolution_amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: true,
          },
          { name: 'resolution_note', type: 'text', isNullable: true },
          { name: 'assigned_admin_id', type: 'uuid', isNullable: true },
          { name: 'assigned_at', type: 'timestamptz', isNullable: true },
          {
            name: 'seller_response_deadline',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'escalation_deadline',
            type: 'timestamptz',
            isNullable: true,
          },
          { name: 'resolved_at', type: 'timestamptz', isNullable: true },
          { name: 'closed_at', type: 'timestamptz', isNullable: true },
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
            columnNames: ['order_id'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['order_item_id'],
            referencedTableName: 'order_items',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['return_request_id'],
            referencedTableName: 'return_requests',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['opened_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['against_user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['assigned_admin_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // dispute_messages
    await queryRunner.createTable(
      new Table({
        name: 'dispute_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'dispute_id', type: 'uuid', isNullable: false },
          { name: 'sender_id', type: 'uuid', isNullable: false },
          { name: 'message_text', type: 'text', isNullable: false },
          { name: 'attachment_urls', type: 'jsonb', isNullable: true },
          { name: 'is_internal_note', type: 'boolean', default: false },
          { name: 'is_system_message', type: 'boolean', default: false },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['dispute_id'],
            referencedTableName: 'disputes',
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

    // dispute_evidence
    await queryRunner.createTable(
      new Table({
        name: 'dispute_evidence',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'dispute_id', type: 'uuid', isNullable: false },
          { name: 'uploaded_by', type: 'uuid', isNullable: false },
          {
            name: 'file_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'file_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
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
            columnNames: ['dispute_id'],
            referencedTableName: 'disputes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['uploaded_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_disputes_opened_by ON disputes(opened_by, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_disputes_against ON disputes(against_user_id, status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status, priority, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_disputes_admin ON disputes(assigned_admin_id, status) WHERE assigned_admin_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_disputes_open ON disputes(priority, created_at DESC) WHERE status NOT IN ('resolved', 'closed')`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_disputes_escalation ON disputes(escalation_deadline) WHERE status NOT IN ('resolved', 'closed')`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute ON dispute_messages(dispute_id, created_at)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_dispute_messages_internal ON dispute_messages(dispute_id) WHERE is_internal_note = TRUE`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute ON dispute_evidence(dispute_id)`,
    );

    // Triggers
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_dispute_resolution_amount') THEN
          ALTER TABLE disputes ADD CONSTRAINT chk_dispute_resolution_amount CHECK (resolution_amount IS NULL OR resolution_amount >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_dispute_different_parties') THEN
          ALTER TABLE disputes ADD CONSTRAINT chk_dispute_different_parties CHECK (opened_by != against_user_id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_disputes_updated_at ON disputes`,
    );
    await queryRunner.dropTable('dispute_evidence', true);
    await queryRunner.dropTable('dispute_messages', true);
    await queryRunner.dropTable('disputes', true);
  }
}
