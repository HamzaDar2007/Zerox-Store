import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceMaterializedViews1700000000034 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. mv_category_stats
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_stats AS
      SELECT
          c.id AS category_id,
          c.name AS category_name,
          c.slug,
          COUNT(DISTINCT p.id) AS product_count,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') AS active_product_count,
          COUNT(DISTINCT s.id) AS seller_count,
          COALESCE(AVG(p.avg_rating), 0)::NUMERIC(3,2) AS avg_rating,
          COALESCE(MIN(p.price), 0) AS min_price,
          COALESCE(MAX(p.price), 0) AS max_price,
          COALESCE(SUM(p.total_sold), 0) AS total_units_sold,
          NOW() AS refreshed_at
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL
      LEFT JOIN sellers s ON s.id = p.seller_id
      GROUP BY c.id, c.name, c.slug
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_category_stats_id ON mv_category_stats (category_id)`);

    // 2. mv_seller_dashboard
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_seller_dashboard AS
      SELECT
          s.id AS seller_id,
          s.business_name,
          s.verification_status AS seller_status,
          COUNT(DISTINCT p.id) AS total_products,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') AS active_products,
          COUNT(DISTINCT o.id) AS total_orders,
          COALESCE(SUM(oi.total_price), 0) AS gross_revenue,
          COALESCE(SUM(oi.commission_amount), 0) AS total_commission,
          COALESCE(SUM(oi.seller_amount), 0) AS net_revenue,
          COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) AS avg_product_rating,
          COUNT(DISTINCT r.id) AS total_reviews,
          COALESCE(sw.balance, 0) AS wallet_balance,
          (s.verification_status = 'approved') AS is_verified,
          NOW() AS refreshed_at
      FROM sellers s
      LEFT JOIN products p ON p.seller_id = s.id AND p.deleted_at IS NULL
      LEFT JOIN order_items oi ON oi.seller_id = s.id AND oi.status NOT IN ('cancelled', 'returned')
      LEFT JOIN orders o ON o.id = oi.order_id AND o.status NOT IN ('cancelled', 'refunded')
      LEFT JOIN reviews r ON r.product_id = p.id AND r.moderation_status = 'approved'
      LEFT JOIN seller_wallets sw ON sw.seller_id = s.id
      GROUP BY s.id, s.business_name, s.verification_status, sw.balance
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_seller_dashboard_id ON mv_seller_dashboard (seller_id)`);

    // 3. mv_trending_products
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_trending_products AS
      SELECT
          p.id AS product_id,
          p.name,
          p.slug,
          p.price,
          p.avg_rating,
          p.total_ratings AS rating_count,
          p.total_sold,
          p.view_count,
          c.name AS category_name,
          b.name AS brand_name,
          COALESCE(recent_sales.qty, 0) AS sales_last_7_days,
          COALESCE(recent_views.cnt, 0) AS views_last_7_days,
          (COALESCE(recent_sales.qty, 0) * 3 + COALESCE(recent_views.cnt, 0) * 0.1 + p.avg_rating * 10)::NUMERIC(10,2) AS trending_score,
          NOW() AS refreshed_at
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN LATERAL (
          SELECT SUM(oi.quantity) AS qty
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          WHERE oi.product_id = p.id
            AND o.created_at >= NOW() - INTERVAL '7 days'
            AND o.status NOT IN ('cancelled', 'refunded')
      ) recent_sales ON TRUE
      LEFT JOIN LATERAL (
          SELECT COUNT(*) AS cnt
          FROM recently_viewed rv
          WHERE rv.product_id = p.id
            AND rv.viewed_at >= NOW() - INTERVAL '7 days'
      ) recent_views ON TRUE
      WHERE p.status = 'active' AND p.deleted_at IS NULL
      ORDER BY trending_score DESC
      LIMIT 500
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_trending_products_id ON mv_trending_products (product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mv_trending_score ON mv_trending_products (trending_score DESC)`);

    // 4. mv_platform_kpis
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_platform_kpis AS
      SELECT
          (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS total_users,
          (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND is_active = TRUE) AS active_users,
          (SELECT COUNT(*) FROM sellers) AS total_sellers,
          (SELECT COUNT(*) FROM sellers WHERE verification_status = 'approved') AS verified_sellers,
          (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL) AS total_products,
          (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL AND status = 'active') AS active_products,
          (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_TRUNC('month', NOW())) AS orders_this_month,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status NOT IN ('cancelled', 'refunded') AND created_at >= DATE_TRUNC('month', NOW())) AS revenue_this_month,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status NOT IN ('cancelled', 'refunded')) AS total_revenue,
          (SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE status NOT IN ('cancelled', 'refunded')) AS avg_order_value,
          (SELECT COUNT(*) FROM orders WHERE status = 'cancelled')::NUMERIC / NULLIF((SELECT COUNT(*) FROM orders), 0) * 100 AS cancellation_rate,
          (SELECT COUNT(*) FROM return_requests WHERE status = 'approved')::NUMERIC / NULLIF((SELECT COUNT(*) FROM orders WHERE status = 'delivered'), 0) * 100 AS return_rate,
          NOW() AS refreshed_at
    `);

    // 5. mv_bestsellers_by_category
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_bestsellers_by_category AS
      SELECT
          p.category_id,
          c.name AS category_name,
          p.id AS product_id,
          p.name AS product_name,
          p.slug,
          p.price,
          p.avg_rating,
          p.total_sold,
          RANK() OVER (PARTITION BY p.category_id ORDER BY p.total_sold DESC) AS rank_in_category,
          NOW() AS refreshed_at
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'active' AND p.deleted_at IS NULL AND p.total_sold > 0
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_bestsellers_cat_prod ON mv_bestsellers_by_category (category_id, product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mv_bestsellers_rank ON mv_bestsellers_by_category (category_id, rank_in_category)`);

    // 6. mv_daily_sales_summary
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales_summary AS
      SELECT
          DATE(o.created_at) AS sale_date,
          COUNT(DISTINCT o.id) AS order_count,
          COUNT(DISTINCT o.user_id) AS unique_customers,
          SUM(o.total_amount) AS gross_sales,
          SUM(o.discount_amount) AS total_discounts,
          SUM(o.delivery_charges) AS total_shipping,
          SUM(o.tax_amount) AS total_tax,
          SUM(o.total_amount - o.discount_amount) AS net_sales,
          AVG(o.total_amount) AS avg_order_value,
          SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
          SUM(CASE WHEN o.status = 'refunded' THEN 1 ELSE 0 END) AS refunded_orders,
          NOW() AS refreshed_at
      FROM orders o
      GROUP BY DATE(o.created_at)
      ORDER BY sale_date DESC
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_sales_date ON mv_daily_sales_summary (sale_date)`);

    // 7. mv_product_search_cache
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_search_cache AS
      SELECT
          p.id AS product_id,
          p.name,
          p.slug,
          p.description,
          p.price,
          p.compare_at_price,
          p.avg_rating,
          p.total_ratings AS rating_count,
          p.total_sold,
          p.status,
          c.name AS category_name,
          c.slug AS category_slug,
          b.name AS brand_name,
          s.business_name AS seller_name,
          (s.verification_status = 'approved') AS seller_verified,
          (
              SETWEIGHT(TO_TSVECTOR('english', COALESCE(p.name, '')), 'A') ||
              SETWEIGHT(TO_TSVECTOR('english', COALESCE(b.name, '')), 'B') ||
              SETWEIGHT(TO_TSVECTOR('english', COALESCE(c.name, '')), 'B') ||
              SETWEIGHT(TO_TSVECTOR('english', COALESCE(p.description, '')), 'C') ||
              SETWEIGHT(TO_TSVECTOR('english', COALESCE(p.tags::TEXT, '')), 'D')
          ) AS search_vector,
          p.created_at,
          NOW() AS refreshed_at
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN sellers s ON s.id = p.seller_id
      WHERE p.deleted_at IS NULL AND p.status = 'active'
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_product_search_id ON mv_product_search_cache (product_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mv_product_search_vector ON mv_product_search_cache USING GIN (search_vector)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mv_product_search_price ON mv_product_search_cache (price)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mv_product_search_rating ON mv_product_search_cache (avg_rating DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_mv_product_search_sold ON mv_product_search_cache (total_sold DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_product_search_cache`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_daily_sales_summary`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_bestsellers_by_category`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_platform_kpis`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_trending_products`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_seller_dashboard`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_category_stats`);
  }
}

