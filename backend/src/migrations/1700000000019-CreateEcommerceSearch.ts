import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableUnique,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceSearch1700000000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // search_history
    await queryRunner.createTable(
      new Table({
        name: 'search_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: true },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'query_text',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          { name: 'results_count', type: 'integer', default: 0 },
          { name: 'filters_applied', type: 'jsonb', isNullable: true },
          { name: 'category_id', type: 'uuid', isNullable: true },
          { name: 'clicked_product_id', type: 'uuid', isNullable: true },
          { name: 'ip_address', type: 'inet', isNullable: true },
          {
            name: 'device_type',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['clicked_product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // recently_viewed
    await queryRunner.createTable(
      new Table({
        name: 'recently_viewed',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'view_count', type: 'integer', default: 1 },
          {
            name: 'viewed_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        uniques: [new TableUnique({ columnNames: ['user_id', 'product_id'] })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // product_recommendations
    await queryRunner.createTable(
      new Table({
        name: 'product_recommendations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'recommended_product_id', type: 'uuid', isNullable: false },
          { name: 'type', type: 'recommendation_type_enum', isNullable: false },
          {
            name: 'score',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: 0.0,
          },
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
        uniques: [
          new TableUnique({
            columnNames: ['product_id', 'recommended_product_id', 'type'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['recommended_product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // product_comparisons
    await queryRunner.createTable(
      new Table({
        name: 'product_comparisons',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'category_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: true },
          { name: 'product_ids', type: 'uuid[]', isNullable: false },
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
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, created_at DESC) WHERE user_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING GIN (to_tsvector('english', query_text))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id, viewed_at)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_recently_viewed_product ON recently_viewed(product_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_recommendations_product ON product_recommendations(product_id, type, score DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_recommendations_rec ON product_recommendations(recommended_product_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_comparisons_user ON product_comparisons(user_id, created_at DESC)`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_recently_viewed_count') THEN
          ALTER TABLE recently_viewed ADD CONSTRAINT chk_recently_viewed_count CHECK (view_count > 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_recommendation_different') THEN
          ALTER TABLE product_recommendations ADD CONSTRAINT chk_recommendation_different CHECK (product_id != recommended_product_id);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_recommendation_score') THEN
          ALTER TABLE product_recommendations ADD CONSTRAINT chk_recommendation_score CHECK (score >= 0 AND score <= 1);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_comparison_products_count') THEN
          ALTER TABLE product_comparisons ADD CONSTRAINT chk_comparison_products_count CHECK (array_length(product_ids, 1) >= 2 AND array_length(product_ids, 1) <= 5);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_comparisons', true);
    await queryRunner.dropTable('product_recommendations', true);
    await queryRunner.dropTable('recently_viewed', true);
    await queryRunner.dropTable('search_history', true);
  }
}
