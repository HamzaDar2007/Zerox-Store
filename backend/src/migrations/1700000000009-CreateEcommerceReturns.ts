import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceReturns1700000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── returns ──
    await queryRunner.query(`
      CREATE TABLE returns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        reason TEXT NOT NULL,
        status VARCHAR(30) NOT NULL CHECK (status IN ('requested', 'approved', 'rejected', 'received', 'refunded')),
        refund_amount NUMERIC(14,4),
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ── return_items ──
    await queryRunner.query(`
      CREATE TABLE return_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
        order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        quantity INT NOT NULL CHECK (quantity > 0),
        condition VARCHAR(50),
        notes TEXT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS return_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS returns CASCADE`);
  }
}
