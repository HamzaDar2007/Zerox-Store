import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixChatThreadStatusAndReviewDefault1700000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix chat_threads status CHECK to include all ConversationStatus enum values
    await queryRunner.query(
      `ALTER TABLE chat_threads DROP CONSTRAINT IF EXISTS "chat_threads_status_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_threads ADD CONSTRAINT "chat_threads_status_check" CHECK (status IN ('open', 'active', 'archived', 'blocked', 'closed', 'resolved'))`,
    );

    // Add DEFAULT 'pending' to reviews.status so inserts without explicit status succeed
    await queryRunner.query(
      `ALTER TABLE reviews ALTER COLUMN status SET DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_threads DROP CONSTRAINT IF EXISTS "chat_threads_status_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_threads ADD CONSTRAINT "chat_threads_status_check" CHECK (status IN ('open', 'resolved', 'archived'))`,
    );
    await queryRunner.query(
      `ALTER TABLE reviews ALTER COLUMN status DROP DEFAULT`,
    );
  }
}
