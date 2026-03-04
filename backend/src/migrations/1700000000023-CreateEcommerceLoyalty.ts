import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEcommerceLoyalty1700000000023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // loyalty_tiers
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_tiers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '50', isNullable: false, isUnique: true },
          { name: 'min_points', type: 'integer', isNullable: false, default: 0 },
          { name: 'max_points', type: 'integer', isNullable: true },
          { name: 'earn_multiplier', type: 'decimal', precision: 3, scale: 2, isNullable: false, default: 1.00 },
          { name: 'benefits', type: 'jsonb', isNullable: true },
          { name: 'icon_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'color_hex', type: 'varchar', length: '7', isNullable: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // loyalty_points
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_points',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'tier_id', type: 'uuid', isNullable: true },
          { name: 'total_earned', type: 'integer', default: 0 },
          { name: 'total_redeemed', type: 'integer', default: 0 },
          { name: 'total_expired', type: 'integer', default: 0 },
          { name: 'available_balance', type: 'integer', default: 0 },
          { name: 'lifetime_points', type: 'integer', default: 0 },
          { name: 'tier_recalculated_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
          new TableForeignKey({ columnNames: ['tier_id'], referencedTableName: 'loyalty_tiers', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // loyalty_transactions
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'loyalty_tx_type_enum', isNullable: false },
          { name: 'points', type: 'integer', isNullable: false },
          { name: 'balance_after', type: 'integer', isNullable: false },
          { name: 'reference_type', type: 'varchar', length: '50', isNullable: true },
          { name: 'reference_id', type: 'uuid', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'expires_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // referral_codes
    await queryRunner.createTable(
      new Table({
        name: 'referral_codes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'code', type: 'varchar', length: '20', isNullable: false, isUnique: true },
          { name: 'total_referrals', type: 'integer', default: 0 },
          { name: 'total_points_earned', type: 'integer', default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // referrals
    await queryRunner.createTable(
      new Table({
        name: 'referrals',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'referrer_user_id', type: 'uuid', isNullable: false },
          { name: 'referred_user_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'referral_code_id', type: 'uuid', isNullable: false },
          { name: 'status', type: 'referral_status_enum', default: `'pending'` },
          { name: 'points_awarded', type: 'integer', default: 0 },
          { name: 'rewarded_at', type: 'timestamptz', isNullable: true },
          { name: 'qualified_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['referrer_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['referred_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
          new TableForeignKey({ columnNames: ['referral_code_id'], referencedTableName: 'referral_codes', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(tier_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_tx_user ON loyalty_transactions(user_id, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_tx_type ON loyalty_transactions(type, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_tx_expiry ON loyalty_transactions(expires_at) WHERE expires_at IS NOT NULL AND type = 'earned'`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_tx_reference ON loyalty_transactions(reference_type, reference_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status) WHERE status = 'pending'`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_loyalty_points_updated_at BEFORE UPDATE ON loyalty_points FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_loyalty_balance_non_negative') THEN
          ALTER TABLE loyalty_points ADD CONSTRAINT chk_loyalty_balance_non_negative CHECK (available_balance >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_loyalty_totals_non_negative') THEN
          ALTER TABLE loyalty_points ADD CONSTRAINT chk_loyalty_totals_non_negative CHECK (total_earned >= 0 AND total_redeemed >= 0 AND total_expired >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_loyalty_tier_points') THEN
          ALTER TABLE loyalty_tiers ADD CONSTRAINT chk_loyalty_tier_points CHECK (min_points >= 0 AND (max_points IS NULL OR max_points > min_points));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_loyalty_multiplier') THEN
          ALTER TABLE loyalty_tiers ADD CONSTRAINT chk_loyalty_multiplier CHECK (earn_multiplier >= 0.5 AND earn_multiplier <= 10);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_referral_different_users') THEN
          ALTER TABLE referrals ADD CONSTRAINT chk_referral_different_users CHECK (referrer_user_id != referred_user_id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_loyalty_points_updated_at ON loyalty_points`);
    await queryRunner.dropTable('referrals', true);
    await queryRunner.dropTable('referral_codes', true);
    await queryRunner.dropTable('loyalty_transactions', true);
    await queryRunner.dropTable('loyalty_points', true);
    await queryRunner.dropTable('loyalty_tiers', true);
  }
}
