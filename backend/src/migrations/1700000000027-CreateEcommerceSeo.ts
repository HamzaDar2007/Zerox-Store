import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateEcommerceSeo1700000000027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // seo_metadata
    await queryRunner.createTable(
      new Table({
        name: 'seo_metadata',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'entity_type', type: 'varchar', length: '50', isNullable: false },
          { name: 'entity_id', type: 'uuid', isNullable: false },
          { name: 'meta_title', type: 'varchar', length: '255', isNullable: true },
          { name: 'meta_description', type: 'varchar', length: '500', isNullable: true },
          { name: 'meta_keywords', type: 'text[]', isNullable: true },
          { name: 'canonical_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'og_title', type: 'varchar', length: '255', isNullable: true },
          { name: 'og_description', type: 'varchar', length: '500', isNullable: true },
          { name: 'og_image_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'og_type', type: 'varchar', length: '50', default: `'website'` },
          { name: 'twitter_card_type', type: 'varchar', length: '30', isNullable: true },
          { name: 'twitter_title', type: 'varchar', length: '255', isNullable: true },
          { name: 'twitter_description', type: 'varchar', length: '500', isNullable: true },
          { name: 'twitter_image_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'structured_data', type: 'jsonb', isNullable: true },
          { name: 'robots_directive', type: 'varchar', length: '100', default: `'index, follow'` },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        uniques: [new TableUnique({ columnNames: ['entity_type', 'entity_id'] })],
      }),
      true,
    );

    // url_redirects
    await queryRunner.createTable(
      new Table({
        name: 'url_redirects',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'source_url', type: 'varchar', length: '500', isNullable: false, isUnique: true },
          { name: 'target_url', type: 'varchar', length: '500', isNullable: false },
          { name: 'redirect_type', type: 'redirect_type_enum', isNullable: false, default: `'301'` },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'hit_count', type: 'integer', default: 0 },
          { name: 'last_hit_at', type: 'timestamptz', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'NOW()' },
        ],
        foreignKeys: [
          new TableForeignKey({ columnNames: ['created_by'], referencedTableName: 'users', referencedColumnNames: ['id'] }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_seo_entity ON seo_metadata(entity_type, entity_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_seo_type ON seo_metadata(entity_type)`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_redirects_source ON url_redirects(source_url) WHERE is_active = TRUE`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_redirects_target ON url_redirects(target_url)`);

    // Triggers
    await queryRunner.query(`CREATE OR REPLACE TRIGGER trg_seo_updated_at BEFORE UPDATE ON seo_metadata FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_seo_updated_at ON seo_metadata`);
    await queryRunner.dropTable('url_redirects', true);
    await queryRunner.dropTable('seo_metadata', true);
  }
}
