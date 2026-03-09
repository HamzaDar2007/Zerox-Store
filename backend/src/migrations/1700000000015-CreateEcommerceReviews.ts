import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableUnique,
  TableForeignKey,
} from 'typeorm';

export class CreateEcommerceReviews1700000000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // reviews
    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'product_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'order_item_id', type: 'uuid', isNullable: false },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'rating', type: 'smallint', isNullable: false },
          { name: 'title', type: 'varchar', length: '200', isNullable: true },
          { name: 'body', type: 'text', isNullable: false },
          { name: 'pros', type: 'text', isNullable: true },
          { name: 'cons', type: 'text', isNullable: true },
          { name: 'images', type: 'text[]', isNullable: true },
          {
            name: 'video_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'is_verified_purchase', type: 'boolean', default: true },
          { name: 'helpful_count', type: 'integer', default: 0 },
          { name: 'unhelpful_count', type: 'integer', default: 0 },
          { name: 'reported_count', type: 'integer', default: 0 },
          {
            name: 'moderation_status',
            type: 'moderation_status_enum',
            default: `'pending'`,
          },
          { name: 'moderated_by', type: 'uuid', isNullable: true },
          { name: 'moderated_at', type: 'timestamptz', isNullable: true },
          { name: 'moderation_note', type: 'text', isNullable: true },
          { name: 'seller_reply', type: 'text', isNullable: true },
          { name: 'seller_replied_at', type: 'timestamptz', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
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
          new TableUnique({ columnNames: ['user_id', 'order_item_id'] }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['product_id'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['order_item_id'],
            referencedTableName: 'order_items',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['variant_id'],
            referencedTableName: 'product_variants',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['moderated_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // review_helpfulness
    await queryRunner.createTable(
      new Table({
        name: 'review_helpfulness',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'review_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'is_helpful', type: 'boolean', isNullable: false },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        uniques: [new TableUnique({ columnNames: ['review_id', 'user_id'] })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['review_id'],
            referencedTableName: 'reviews',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // review_reports
    await queryRunner.createTable(
      new Table({
        name: 'review_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'review_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'reason', type: 'report_reason_enum', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'status',
            type: 'moderation_status_enum',
            default: `'pending'`,
          },
          { name: 'reviewed_by', type: 'uuid', isNullable: true },
          { name: 'reviewed_at', type: 'timestamptz', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        uniques: [new TableUnique({ columnNames: ['review_id', 'user_id'] })],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['review_id'],
            referencedTableName: 'reviews',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
          new TableForeignKey({
            columnNames: ['reviewed_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          }),
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, moderation_status, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(product_id, rating) WHERE moderation_status = 'approved'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_pending ON reviews(created_at DESC) WHERE moderation_status = 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_helpful ON reviews(product_id, helpful_count DESC) WHERE moderation_status = 'approved'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_order_item ON reviews(order_item_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review ON review_helpfulness(review_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user ON review_helpfulness(user_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_review_reports_review ON review_reports(review_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_review_reports_pending ON review_reports(created_at DESC) WHERE status = 'pending'`,
    );

    // Triggers
    await queryRunner.query(
      `CREATE OR REPLACE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp()`,
    );

    // Check constraints
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_reviews_rating_range') THEN
          ALTER TABLE reviews ADD CONSTRAINT chk_reviews_rating_range CHECK (rating >= 1 AND rating <= 5);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_reviews_helpful_non_negative') THEN
          ALTER TABLE reviews ADD CONSTRAINT chk_reviews_helpful_non_negative CHECK (helpful_count >= 0 AND unhelpful_count >= 0);
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_reviews_reported_non_negative') THEN
          ALTER TABLE reviews ADD CONSTRAINT chk_reviews_reported_non_negative CHECK (reported_count >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews`,
    );
    await queryRunner.dropTable('review_reports', true);
    await queryRunner.dropTable('review_helpfulness', true);
    await queryRunner.dropTable('reviews', true);
  }
}
