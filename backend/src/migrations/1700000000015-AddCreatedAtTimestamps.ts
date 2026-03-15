import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtTimestamps1700000000015 implements MigrationInterface {
  name = 'AddCreatedAtTimestamps1700000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add created_at to tables that need chronological ordering
    const tables = [
      'notifications',
      'reviews',
      'orders',
      'payments',
      'returns',
      'subscriptions',
      'chat_threads',
      'chat_messages',
      'products',
      'sellers',
      'stores',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      );
      await queryRunner.query(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'notifications',
      'reviews',
      'orders',
      'payments',
      'returns',
      'subscriptions',
      'chat_threads',
      'chat_messages',
      'products',
      'sellers',
      'stores',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE ${table} DROP COLUMN IF EXISTS updated_at`,
      );
      await queryRunner.query(
        `ALTER TABLE ${table} DROP COLUMN IF EXISTS created_at`,
      );
    }
  }
}
