import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemQuantity1700000000016 implements MigrationInterface {
  name = 'AddOrderItemQuantity1700000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE order_items DROP COLUMN IF EXISTS quantity`,
    );
  }
}
