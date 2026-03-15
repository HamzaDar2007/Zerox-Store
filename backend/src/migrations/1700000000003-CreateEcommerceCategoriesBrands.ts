import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceCategoriesBrands1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── categories ──
    await queryRunner.query(`
      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR(200),
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // ── brands ──
    await queryRunner.query(`
      CREATE TABLE brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200),
        slug VARCHAR(200) UNIQUE NOT NULL,
        logo_url TEXT,
        website_url TEXT,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS brands CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories CASCADE`);
  }
}
