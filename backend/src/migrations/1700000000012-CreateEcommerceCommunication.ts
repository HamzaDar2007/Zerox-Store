import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceCommunication1700000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── notifications ──
    await queryRunner.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'webhook')),
        type VARCHAR(100) NOT NULL,
        title VARCHAR(300),
        body TEXT,
        action_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMPTZ,
        sent_at TIMESTAMPTZ,
        metadata JSONB
      )
    `);

    // ── chat_threads ──
    await queryRunner.query(`
      CREATE TABLE chat_threads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject VARCHAR(300),
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'resolved', 'archived'))
      )
    `);

    // ── chat_thread_participants ──
    await queryRunner.query(`
      CREATE TABLE chat_thread_participants (
        thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_read_at TIMESTAMPTZ,
        PRIMARY KEY (thread_id, user_id)
      )
    `);

    // ── chat_messages ──
    await queryRunner.query(`
      CREATE TABLE chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id),
        body TEXT NOT NULL,
        attachment_url TEXT,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);

    // ── search_queries ──
    await queryRunner.query(`
      CREATE TABLE search_queries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(200),
        query TEXT NOT NULL,
        result_count INT,
        clicked_product UUID REFERENCES products(id) ON DELETE SET NULL,
        searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS search_queries CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS chat_messages CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS chat_thread_participants CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS chat_threads CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
  }
}
