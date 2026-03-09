import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceCms1700000000026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // banners
    await queryRunner.createTable(
      new Table({
        name: 'banners',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'title', type: 'varchar', length: '200', isNullable: false },
          {
            name: 'subtitle',
            type: 'varchar',
            length: '300',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'mobile_image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'link_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'link_type',
            type: 'banner_link_type_enum',
            isNullable: true,
          },
          { name: 'link_target_id', type: 'uuid', isNullable: true },
          {
            name: 'position',
            type: 'banner_position_enum',
            isNullable: false,
            default: `'homepage_hero'`,
          },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'starts_at', type: 'timestamptz', isNullable: true },
          { name: 'ends_at', type: 'timestamptz', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'view_count', type: 'integer', default: 0 },
          { name: 'click_count', type: 'integer', default: 0 },
          { name: 'created_by', type: 'uuid', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['created_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // pages
    await queryRunner.createTable(
      new Table({
        name: 'pages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '200',
            isNullable: false,
            isUnique: true,
          },
          { name: 'title', type: 'varchar', length: '200', isNullable: false },
          { name: 'content', type: 'text', isNullable: false },
          { name: 'excerpt', type: 'varchar', length: '500', isNullable: true },
          {
            name: 'meta_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'meta_description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'parent_id', type: 'uuid', isNullable: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'is_published', type: 'boolean', default: false },
          { name: 'published_at', type: 'timestamptz', isNullable: true },
          { name: 'author_id', type: 'uuid', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['parent_id'],
            referencedTableName: 'pages',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['author_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position, sort_order) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(starts_at, ends_at) WHERE is_active = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_banners_link ON banners(link_type, link_target_id) WHERE link_target_id IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published, sort_order) WHERE is_published = TRUE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_pages_search ON pages USING GIN (to_tsvector('english', title || ' ' || content))`,
    );

    // Triggers
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_banner_dates') THEN
          ALTER TABLE banners ADD CONSTRAINT chk_banner_dates CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_banner_counts') THEN
          ALTER TABLE banners ADD CONSTRAINT chk_banner_counts CHECK (view_count >= 0 AND click_count >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_pages_updated_at ON pages`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_banners_updated_at ON banners`,
    );
    await queryRunner.dropTable('pages', true);
    await queryRunner.dropTable('banners', true);
  }
}
