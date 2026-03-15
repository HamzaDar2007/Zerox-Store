import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceAudit1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── audit_logs ──
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL CHECK (action IN ('insert', 'update', 'delete', 'login', 'logout', 'export')),
        table_name VARCHAR(100) NOT NULL,
        record_id UUID,
        diff JSONB,
        ip_address INET,
        user_agent TEXT,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs CASCADE`);
  }
}
