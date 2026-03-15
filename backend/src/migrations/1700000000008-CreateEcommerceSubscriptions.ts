import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceSubscriptions1700000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── subscription_plans ──
    await queryRunner.query(`
      CREATE TABLE subscription_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price NUMERIC(14,4) NOT NULL,
        currency CHAR(3) NOT NULL,
        interval VARCHAR(20) NOT NULL CHECK (interval IN ('daily', 'weekly', 'monthly', 'yearly')),
        interval_count INT NOT NULL,
        trial_days INT DEFAULT 0
      )
    `);

    // ── subscriptions ──
    await queryRunner.query(`
      CREATE TABLE subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL REFERENCES subscription_plans(id),
        status VARCHAR(20) NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
        gateway VARCHAR(50),
        gateway_sub_id TEXT,
        current_period_start TIMESTAMPTZ NOT NULL,
        current_period_end TIMESTAMPTZ NOT NULL,
        trial_ends_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS subscriptions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS subscription_plans CASCADE`);
  }
}
