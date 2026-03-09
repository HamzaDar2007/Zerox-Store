import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommercePayments1700000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // payments
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'order_id', type: 'uuid', isNullable: false },
          {
            name: 'transaction_id',
            type: 'varchar',
            length: '200',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'gateway_name',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          { name: 'method', type: 'payment_method_enum', isNullable: false },
          {
            name: 'currency_code',
            type: 'varchar',
            length: '3',
            default: `'PKR'`,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'gateway_fee',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0.0,
          },
          {
            name: 'platform_fee',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0.0,
          },
          {
            name: 'net_amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: true,
          },
          { name: 'status', type: 'payment_status_enum', default: `'pending'` },
          { name: 'is_captured', type: 'boolean', default: false },
          { name: 'authorized_at', type: 'timestamptz', isNullable: true },
          { name: 'captured_at', type: 'timestamptz', isNullable: true },
          { name: 'gateway_response', type: 'jsonb', isNullable: true },
          { name: 'failure_reason', type: 'text', isNullable: true },
          { name: 'retry_count', type: 'smallint', default: 0 },
          { name: 'billing_address_id', type: 'uuid', isNullable: true },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'paid_at', type: 'timestamptz', isNullable: true },
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
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['billing_address_id'],
            referencedTableName: 'addresses',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // payment_attempts
    await queryRunner.createTable(
      new Table({
        name: 'payment_attempts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'payment_id', type: 'uuid', isNullable: false },
          { name: 'attempt_number', type: 'smallint', isNullable: false },
          { name: 'method', type: 'payment_method_enum', isNullable: false },
          {
            name: 'gateway_name',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          { name: 'status', type: 'varchar', length: '30', isNullable: false },
          { name: 'gateway_response', type: 'jsonb', isNullable: true },
          {
            name: 'error_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'ip_address', type: 'inet', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['payment_id'],
            referencedTableName: 'payments',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // refunds
    await queryRunner.createTable(
      new Table({
        name: 'refunds',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'refund_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
            default: 'fn_generate_refund_number()',
          },
          { name: 'order_id', type: 'uuid', isNullable: false },
          { name: 'order_item_id', type: 'uuid', isNullable: true },
          { name: 'payment_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'reason', type: 'text', isNullable: false },
          { name: 'evidence_images', type: 'jsonb', isNullable: true },
          {
            name: 'amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency_code',
            type: 'varchar',
            length: '3',
            default: `'PKR'`,
          },
          {
            name: 'refund_method',
            type: 'refund_method_enum',
            default: `'original_payment'`,
          },
          {
            name: 'gateway_refund_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'refund_status_enum',
            default: `'requested'`,
          },
          { name: 'admin_note', type: 'text', isNullable: true },
          { name: 'approved_by', type: 'uuid', isNullable: true },
          { name: 'approved_at', type: 'timestamptz', isNullable: true },
          { name: 'rejected_reason', type: 'text', isNullable: true },
          { name: 'processed_at', type: 'timestamptz', isNullable: true },
          { name: 'gateway_response', type: 'jsonb', isNullable: true },
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
            columnNames: ['payment_id'],
            referencedTableName: 'payments',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['approved_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // saved_payment_methods
    await queryRunner.createTable(
      new Table({
        name: 'saved_payment_methods',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'varchar', length: '30', isNullable: false },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          { name: 'token_encrypted', type: 'text', isNullable: false },
          { name: 'last_four', type: 'varchar', length: '4', isNullable: true },
          {
            name: 'card_brand',
            type: 'varchar',
            length: '30',
            isNullable: true,
          },
          {
            name: 'card_holder_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'expiry_month', type: 'smallint', isNullable: true },
          { name: 'expiry_year', type: 'smallint', isNullable: true },
          {
            name: 'wallet_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'last_used_at', type: 'timestamptz', isNullable: true },
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
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id) WHERE transaction_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method, status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(gateway_name, status)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment ON payment_attempts(payment_id, attempt_number)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_refunds_pending ON refunds(created_at DESC) WHERE status = 'requested'`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_payments_user ON saved_payment_methods(user_id) WHERE is_active = TRUE`,
    );

    // Triggers
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_saved_payments_updated_at BEFORE UPDATE ON saved_payment_methods FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_amount_positive') THEN
          ALTER TABLE payments ADD CONSTRAINT chk_payments_amount_positive CHECK (amount > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_retry_count') THEN
          ALTER TABLE payments ADD CONSTRAINT chk_payments_retry_count CHECK (retry_count >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_refunds_amount_positive') THEN
          ALTER TABLE refunds ADD CONSTRAINT chk_refunds_amount_positive CHECK (amount > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_attempt_number_positive') THEN
          ALTER TABLE payment_attempts ADD CONSTRAINT chk_attempt_number_positive CHECK (attempt_number > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_saved_expiry') THEN
          ALTER TABLE saved_payment_methods ADD CONSTRAINT chk_saved_expiry CHECK (expiry_month IS NULL OR (expiry_month >= 1 AND expiry_month <= 12));
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_saved_payments_updated_at ON saved_payment_methods`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_refunds_updated_at ON refunds`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments`,
    );
    await queryRunner.dropTable('saved_payment_methods', true);
    await queryRunner.dropTable('refunds', true);
    await queryRunner.dropTable('payment_attempts', true);
    await queryRunner.dropTable('payments', true);
  }
}
