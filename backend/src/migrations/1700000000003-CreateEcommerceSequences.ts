import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceSequences1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS refund_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS return_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS dispute_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS shipment_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS payout_number_seq START WITH 1 INCREMENT BY 1 NO CYCLE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE IF EXISTS payout_number_seq`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS shipment_number_seq`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS dispute_number_seq`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS return_number_seq`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS ticket_number_seq`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS refund_number_seq`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS order_number_seq`);
  }
}
