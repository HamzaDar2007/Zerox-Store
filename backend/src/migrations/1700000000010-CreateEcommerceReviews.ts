import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceReviews1700000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── reviews ──
    await queryRunner.query(`
      CREATE TABLE reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(300),
        body TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
        seller_reply TEXT,
        seller_reply_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (product_id, user_id, order_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reviews CASCADE`);
  }
}
