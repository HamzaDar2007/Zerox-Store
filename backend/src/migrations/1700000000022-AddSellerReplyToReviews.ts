import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSellerReplyToReviews1700000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "seller_reply" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "seller_reply_at" timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "seller_reply_at"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "seller_reply"`);
  }
}
