import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCheckConstraints1700000000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix payments.status CHECK - add 'paid', 'completed', 'partially_refunded'
    await queryRunner.query(`
      ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
    `);
    await queryRunner.query(`
      ALTER TABLE payments ADD CONSTRAINT payments_status_check
        CHECK (status IN ('pending', 'authorized', 'captured', 'paid', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'));
    `);

    // Fix subscription_plans.interval CHECK - add 'day', 'week', 'month', 'year' alongside existing values
    await queryRunner.query(`
      ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_interval_check;
    `);
    await queryRunner.query(`
      ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_interval_check
        CHECK (interval IN ('daily', 'weekly', 'monthly', 'yearly', 'day', 'week', 'month', 'year'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert payments.status CHECK
    await queryRunner.query(`
      ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
    `);
    await queryRunner.query(`
      ALTER TABLE payments ADD CONSTRAINT payments_status_check
        CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'));
    `);

    // Revert subscription_plans.interval CHECK
    await queryRunner.query(`
      ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_interval_check;
    `);
    await queryRunner.query(`
      ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_interval_check
        CHECK (interval IN ('daily', 'weekly', 'monthly', 'yearly'));
    `);
  }
}
