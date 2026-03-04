import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceSellersStores1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // sellers
    await queryRunner.createTable(
      new Table({
        name: 'sellers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'business_name', type: 'varchar', length: '200', isNullable: false },
          { name: 'cnic', type: 'varchar', length: '20', isNullable: true, isUnique: true },
          { name: 'cnic_front_image', type: 'varchar', length: '500', isNullable: true },
          { name: 'cnic_back_image', type: 'varchar', length: '500', isNullable: true },
          { name: 'tax_id', type: 'varchar', length: '50', isNullable: true },
          { name: 'business_reg_no', type: 'varchar', length: '100', isNullable: true },
          { name: 'bank_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'bank_account_no', type: 'varchar', length: '50', isNullable: true },
          { name: 'bank_account_title', type: 'varchar', length: '100', isNullable: true },
          { name: 'bank_branch_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'payout_frequency', type: 'payout_frequency_enum', default: `'weekly'` },
          { name: 'min_payout_amount', type: 'decimal', precision: 12, scale: 2, default: 500.00 },
          { name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 10.00 },
          { name: 'verification_status', type: 'verification_status_enum', default: `'pending'` },
          { name: 'rejection_reason', type: 'text', isNullable: true },
          { name: 'approved_at', type: 'timestamptz', isNullable: true },
          { name: 'approved_by', type: 'uuid', isNullable: true },
          { name: 'total_products', type: 'integer', default: 0 },
          { name: 'total_sales', type: 'integer', default: 0 },
          { name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0.00 },
          { name: 'response_time_avg', type: 'integer', default: 0 },
          { name: 'vacation_mode', type: 'boolean', default: false },
          { name: 'vacation_start', type: 'date', isNullable: true },
          { name: 'vacation_end', type: 'date', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['approved_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // stores
    await queryRunner.createTable(
      new Table({
        name: 'stores',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'seller_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'name', type: 'varchar', length: '200', isNullable: false },
          { name: 'slug', type: 'varchar', length: '200', isNullable: false, isUnique: true },
          { name: 'logo_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'banner_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'return_policy', type: 'text', isNullable: true },
          { name: 'shipping_policy', type: 'text', isNullable: true },
          { name: 'meta_title', type: 'varchar', length: '255', isNullable: true },
          { name: 'meta_description', type: 'varchar', length: '500', isNullable: true },
          { name: 'rating', type: 'decimal', precision: 3, scale: 2, default: 0.00 },
          { name: 'total_sales', type: 'integer', default: 0 },
          { name: 'total_followers', type: 'integer', default: 0 },
          { name: 'avg_processing_hours', type: 'integer', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // store_followers
    await queryRunner.createTable(
      new Table({
        name: 'store_followers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'store_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'followed_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        uniques: [new TableUnique({ columnNames: ['store_id', 'user_id'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['store_id'], referencedTableName: 'stores', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // seller_wallets
    await queryRunner.createTable(
      new Table({
        name: 'seller_wallets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'seller_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'balance', type: 'decimal', precision: 14, scale: 2, default: 0.00 },
          { name: 'pending_balance', type: 'decimal', precision: 14, scale: 2, default: 0.00 },
          { name: 'total_earned', type: 'decimal', precision: 14, scale: 2, default: 0.00 },
          { name: 'total_withdrawn', type: 'decimal', precision: 14, scale: 2, default: 0.00 },
          { name: 'total_commission_paid', type: 'decimal', precision: 14, scale: 2, default: 0.00 },
          { name: 'last_payout_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // wallet_transactions
    await queryRunner.createTable(
      new Table({
        name: 'wallet_transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'wallet_id', type: 'uuid', isNullable: false },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'type', type: 'wallet_tx_type_enum', isNullable: false },
          { name: 'amount', type: 'decimal', precision: 14, scale: 2, isNullable: false },
          { name: 'commission', type: 'decimal', precision: 12, scale: 2, default: 0.00 },
          { name: 'net_amount', type: 'decimal', precision: 14, scale: 2, isNullable: false },
          { name: 'balance_after', type: 'decimal', precision: 14, scale: 2, isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'reference_type', type: 'varchar', length: '50', isNullable: true },
          { name: 'reference_id', type: 'uuid', isNullable: true },
          { name: 'status', type: 'wallet_tx_status_enum', default: `'completed'` },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['wallet_id'], referencedTableName: 'seller_wallets', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // seller_documents
    await queryRunner.createTable(
      new Table({
        name: 'seller_documents',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'seller_id', type: 'uuid', isNullable: false },
          { name: 'document_type', type: 'seller_doc_type_enum', isNullable: false },
          { name: 'file_url', type: 'varchar', length: '500', isNullable: false },
          { name: 'status', type: 'doc_status_enum', default: `'pending'` },
          { name: 'reviewed_by', type: 'uuid', isNullable: true },
          { name: 'reviewed_at', type: 'timestamptz', isNullable: true },
          { name: 'rejection_reason', type: 'text', isNullable: true },
          { name: 'expires_at', type: 'date', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['reviewed_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // seller_violations
    await queryRunner.createTable(
      new Table({
        name: 'seller_violations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'seller_id', type: 'uuid', isNullable: false },
          { name: 'violation_type', type: 'varchar', length: '50', isNullable: false },
          { name: 'description', type: 'text', isNullable: false },
          { name: 'evidence_urls', type: 'text[]', isNullable: true },
          { name: 'severity', type: 'violation_severity_enum', isNullable: false, default: `'warning'` },
          { name: 'penalty_action', type: 'violation_penalty_enum', isNullable: true },
          { name: 'penalty_amount', type: 'decimal', precision: 12, scale: 2, isNullable: true },
          { name: 'status', type: 'varchar', length: '30', default: `'open'` },
          { name: 'acknowledged_at', type: 'timestamptz', isNullable: true },
          { name: 'resolved_at', type: 'timestamptz', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // seller_performance_snapshots
    await queryRunner.createTable(
      new Table({
        name: 'seller_performance_snapshots',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'seller_id', type: 'uuid', isNullable: false },
          { name: 'snapshot_date', type: 'date', isNullable: false },
          { name: 'orders_received', type: 'integer', default: 0 },
          { name: 'orders_fulfilled', type: 'integer', default: 0 },
          { name: 'orders_cancelled', type: 'integer', default: 0 },
          { name: 'avg_fulfillment_hours', type: 'decimal', precision: 8, scale: 2, isNullable: true },
          { name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, isNullable: true },
          { name: 'total_revenue', type: 'decimal', precision: 14, scale: 2, default: 0.00 },
          { name: 'total_commission', type: 'decimal', precision: 14, scale: 2, default: 0.00 },
          { name: 'return_rate', type: 'decimal', precision: 5, scale: 2, default: 0.00 },
          { name: 'response_rate', type: 'decimal', precision: 5, scale: 2, default: 0.00 },
          { name: 'response_time_avg_min', type: 'integer', isNullable: true },
          { name: 'new_products_listed', type: 'integer', default: 0 },
          { name: 'new_reviews_received', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        uniques: [new TableUnique({ columnNames: ['seller_id', 'snapshot_date'] })],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['seller_id'], referencedTableName: 'sellers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sellers_user ON sellers(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sellers_verification ON sellers(verification_status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sellers_active ON sellers(id) WHERE verification_status = 'approved' AND vacation_mode = FALSE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stores_seller ON stores(seller_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(id) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_stores_name_trgm ON stores USING GIN (name gin_trgm_ops)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_store_followers_store ON store_followers(store_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_store_followers_user ON store_followers(user_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallet_tx_order ON wallet_transactions(order_id) WHERE order_id IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(type, status)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_seller_docs_seller ON seller_documents(seller_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_seller_docs_status ON seller_documents(status) WHERE status = 'pending'`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_seller_violations_seller ON seller_violations(seller_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_seller_violations_open ON seller_violations(severity, created_at DESC) WHERE status = 'open'`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_seller_perf_seller_date ON seller_performance_snapshots(seller_id, snapshot_date DESC)`);

    // Triggers
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_sellers_updated_at
        BEFORE UPDATE ON sellers
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_stores_updated_at
        BEFORE UPDATE ON stores
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_wallets_updated_at
        BEFORE UPDATE ON seller_wallets
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_wallet_balance_non_negative') THEN
          ALTER TABLE seller_wallets ADD CONSTRAINT chk_wallet_balance_non_negative CHECK (balance >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_wallet_pending_non_negative') THEN
          ALTER TABLE seller_wallets ADD CONSTRAINT chk_wallet_pending_non_negative CHECK (pending_balance >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_commission_rate_range') THEN
          ALTER TABLE sellers ADD CONSTRAINT chk_commission_rate_range CHECK (commission_rate >= 0 AND commission_rate <= 50);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_wallet_tx_amount_positive') THEN
          ALTER TABLE wallet_transactions ADD CONSTRAINT chk_wallet_tx_amount_positive CHECK (amount > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_vacation_dates') THEN
          ALTER TABLE sellers ADD CONSTRAINT chk_vacation_dates CHECK (vacation_end IS NULL OR vacation_end >= vacation_start);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_wallets_updated_at ON seller_wallets`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_sellers_updated_at ON sellers`);
    await queryRunner.dropTable('seller_performance_snapshots', true);
    await queryRunner.dropTable('seller_violations', true);
    await queryRunner.dropTable('seller_documents', true);
    await queryRunner.dropTable('wallet_transactions', true);
    await queryRunner.dropTable('seller_wallets', true);
    await queryRunner.dropTable('store_followers', true);
    await queryRunner.dropTable('stores', true);
    await queryRunner.dropTable('sellers', true);
  }
}
