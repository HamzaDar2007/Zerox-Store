import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEcommerceChat1700000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // conversations
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'buyer_id', type: 'uuid', isNullable: false },
          { name: 'seller_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: true },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'status', type: 'conversation_status_enum', default: `'active'` },
          { name: 'message_count', type: 'integer', default: 0 },
          { name: 'unread_buyer_count', type: 'integer', default: 0 },
          { name: 'unread_seller_count', type: 'integer', default: 0 },
          { name: 'last_message_at', type: 'timestamptz', isNullable: true },
          { name: 'last_message_preview', type: 'varchar', length: '200', isNullable: true },
          { name: 'last_message_sender_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['buyer_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['last_message_sender_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // messages
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'conversation_id', type: 'uuid', isNullable: false },
          { name: 'sender_id', type: 'uuid', isNullable: false },
          { name: 'message_type', type: 'message_type_enum', default: `'text'` },
          { name: 'content', type: 'text', isNullable: true },
          { name: 'attachment_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'attachment_type', type: 'varchar', length: '50', isNullable: true },
          { name: 'attachment_name', type: 'varchar', length: '200', isNullable: true },
          { name: 'reference_product_id', type: 'uuid', isNullable: true },
          { name: 'reference_order_id', type: 'uuid', isNullable: true },
          { name: 'is_read', type: 'boolean', default: false },
          { name: 'read_at', type: 'timestamptz', isNullable: true },
          { name: 'is_system_message', type: 'boolean', default: false },
          { name: 'deleted_by_sender', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['conversation_id'], referencedTableName: 'conversations', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['sender_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['reference_product_id'], referencedTableName: 'products', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['reference_order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id, last_message_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id, last_message_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_product ON conversations(product_id) WHERE product_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_order ON conversations(order_id) WHERE order_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(last_message_at DESC) WHERE status = 'active'`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, created_at) WHERE is_read = FALSE`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_conversation_counts') THEN
          ALTER TABLE conversations ADD CONSTRAINT chk_conversation_counts CHECK (unread_buyer_count >= 0 AND unread_seller_count >= 0 AND message_count >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations`);
    await queryRunner.dropTable('messages', true);
    await queryRunner.dropTable('conversations', true);
  }
}
