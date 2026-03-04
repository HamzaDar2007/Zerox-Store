import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceExtensions1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "btree_gist"`);

    await queryRunner.query(`COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions for primary keys'`);
    await queryRunner.query(`COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions for hashing and encryption'`);
    await queryRunner.query(`COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy text search'`);
    await queryRunner.query(`COMMENT ON EXTENSION "btree_gist" IS 'GiST index operator classes for btree-compatible types'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS "btree_gist"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pg_trgm"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
