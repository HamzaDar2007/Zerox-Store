import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceAuthUsers1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'email', type: 'varchar', length: '150', isNullable: false },
          { name: 'password', type: 'varchar', length: '255', isNullable: false },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'role', type: 'user_role_enum', isNullable: false, default: `'customer'` },
          { name: 'is_email_verified', type: 'boolean', default: false },
          { name: 'email_verified_at', type: 'timestamptz', isNullable: true },
          { name: 'phone_verified_at', type: 'timestamptz', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'profile_image', type: 'varchar', length: '500', isNullable: true },
          { name: 'date_of_birth', type: 'date', isNullable: true },
          { name: 'gender', type: 'gender_enum', isNullable: true },
          { name: 'referral_code', type: 'varchar', length: '20', isNullable: true, isUnique: true },
          { name: 'last_login_at', type: 'timestamptz', isNullable: true },
          { name: 'last_login_ip', type: 'inet', isNullable: true },
          { name: 'login_attempts', type: 'smallint', default: 0 },
          { name: 'locked_until', type: 'timestamptz', isNullable: true },
          { name: 'two_factor_enabled', type: 'boolean', default: false },
          { name: 'two_factor_secret', type: 'varchar', length: '255', isNullable: true },
          { name: 'two_factor_backup_codes', type: 'text[]', isNullable: true },
          { name: 'preferred_language_id', type: 'uuid', isNullable: true },
          { name: 'preferred_currency_id', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // Partial unique index on email where deleted_at IS NULL
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email) WHERE deleted_at IS NULL`);

    // roles
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '50', isNullable: false, isUnique: true },
          { name: 'display_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_system', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
      }),
      true,
    );

    // permissions
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'role_id', type: 'uuid', isNullable: false },
          { name: 'module', type: 'varchar', length: '50', isNullable: false },
          { name: 'action', type: 'varchar', length: '50', isNullable: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        uniques: [
          new TableUnique({ columnNames: ['role_id', 'module', 'action'] }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['role_id'],
            referencedTableName: 'roles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // user_roles
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'role_id', type: 'uuid', isNullable: false },
          { name: 'assigned_by', type: 'uuid', isNullable: true },
          { name: 'assigned_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        uniques: [
          new TableUnique({ columnNames: ['user_id', 'role_id'] }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['role_id'],
            referencedTableName: 'roles',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['assigned_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // sessions
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'refresh_token', type: 'text', isNullable: false },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'device_fingerprint', type: 'varchar', length: '255', isNullable: true },
          { name: 'is_valid', type: 'boolean', default: true },
          { name: 'last_activity_at', type: 'timestamptz', default: 'NOW()' },
          { name: 'expires_at', type: 'timestamptz', isNullable: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
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

    // addresses
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'label', type: 'varchar', length: '50', isNullable: true },
          { name: 'full_name', type: 'varchar', length: '100', isNullable: false },
          { name: 'phone', type: 'varchar', length: '20', isNullable: false },
          { name: 'country', type: 'varchar', length: '100', isNullable: false, default: `'Pakistan'` },
          { name: 'province', type: 'varchar', length: '100', isNullable: false },
          { name: 'city', type: 'varchar', length: '100', isNullable: false },
          { name: 'area', type: 'varchar', length: '100', isNullable: true },
          { name: 'street_address', type: 'text', isNullable: false },
          { name: 'postal_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'latitude', type: 'decimal', precision: 10, scale: 7, isNullable: true },
          { name: 'longitude', type: 'decimal', precision: 10, scale: 7, isNullable: true },
          { name: 'delivery_instructions', type: 'text', isNullable: true },
          { name: 'is_default_shipping', type: 'boolean', default: false },
          { name: 'is_default_billing', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
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

    // login_history
    await queryRunner.createTable(
      new Table({
        name: 'login_history',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'login_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'device_fingerprint', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'login_status_enum', isNullable: false, default: `'success'` },
          { name: 'failure_reason', type: 'text', isNullable: true },
          { name: 'location_country', type: 'varchar', length: '100', isNullable: true },
          { name: 'location_city', type: 'varchar', length: '100', isNullable: true },
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
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL AND deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, expires_at) WHERE is_valid = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(refresh_token) WHERE is_valid = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at) WHERE is_valid = TRUE`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id, login_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_login_history_ip ON login_history(ip_address)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_login_history_status ON login_history(status, login_at DESC)`);

    // Triggers
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_addresses_updated_at
        BEFORE UPDATE ON addresses
        FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()
    `);

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_email_format') THEN
          ALTER TABLE users ADD CONSTRAINT chk_users_email_format CHECK (fn_is_valid_email(email));
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_login_attempts') THEN
          ALTER TABLE users ADD CONSTRAINT chk_users_login_attempts CHECK (login_attempts >= 0 AND login_attempts <= 10);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_addresses_updated_at ON addresses`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_users_updated_at ON users`);
    await queryRunner.dropTable('login_history', true);
    await queryRunner.dropTable('addresses', true);
    await queryRunner.dropTable('sessions', true);
    await queryRunner.dropTable('user_roles', true);
    await queryRunner.dropTable('permissions', true);
    await queryRunner.dropTable('roles', true);
    await queryRunner.dropTable('users', true);
  }
}
