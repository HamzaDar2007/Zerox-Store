import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceSellersStores1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── sellers ──
    await queryRunner.query(`
      CREATE TABLE sellers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        display_name VARCHAR(200) NOT NULL,
        legal_name VARCHAR(200),
        tax_id VARCHAR(100),
        commission_rate NUMERIC(5,2) DEFAULT 10.00,
        status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ── stores ──
    await queryRunner.query(`
      CREATE TABLE stores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        name VARCHAR(200),
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        logo_url TEXT,
        banner_url TEXT,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS stores CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS sellers CASCADE`);
  }
}
