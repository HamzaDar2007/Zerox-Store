import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceMaintenance1700000000035 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all functions first to avoid signature conflicts
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_daily_maintenance()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_escalate_sla_breached_tickets()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_close_stale_tickets(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_deactivate_expired_banners()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_activate_scheduled_flash_sales()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_expire_flash_sales()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_old_notifications(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_deactivate_expired_vouchers()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_search_history(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_abandoned_carts(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_expired_sessions()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_refresh_hot_views()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_refresh_all_materialized_views()`);

    // 1. fn_refresh_all_materialized_views
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_refresh_all_materialized_views()
      RETURNS VOID AS $$
      BEGIN
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_stats;
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_seller_dashboard;
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_products;
          REFRESH MATERIALIZED VIEW mv_platform_kpis;
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_bestsellers_by_category;
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_summary;
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_search_cache;
          RAISE NOTICE 'All materialized views refreshed at %', NOW();
      END;
      $$ LANGUAGE plpgsql
    `);

    // 2. fn_refresh_hot_views
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_refresh_hot_views()
      RETURNS VOID AS $$
      BEGIN
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_products;
          REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_search_cache;
          RAISE NOTICE 'Hot views refreshed at %', NOW();
      END;
      $$ LANGUAGE plpgsql
    `);

    // 3. fn_cleanup_expired_sessions
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_cleanup_expired_sessions()
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          DELETE FROM sessions WHERE expires_at < NOW();
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Cleaned up % expired sessions', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 4. fn_cleanup_abandoned_carts
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_cleanup_abandoned_carts(p_days INT DEFAULT 30)
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          DELETE FROM cart_items
          WHERE cart_id IN (
              SELECT id FROM carts WHERE updated_at < NOW() - (p_days || ' days')::INTERVAL AND user_id IS NULL
          );
          DELETE FROM carts WHERE updated_at < NOW() - (p_days || ' days')::INTERVAL AND user_id IS NULL;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Cleaned up % abandoned guest carts older than % days', v_count, p_days;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 5. fn_cleanup_search_history
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_cleanup_search_history(p_days INT DEFAULT 90)
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          DELETE FROM search_history WHERE searched_at < NOW() - (p_days || ' days')::INTERVAL;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Cleaned up % old search history entries', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 6. fn_deactivate_expired_vouchers
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_deactivate_expired_vouchers()
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          UPDATE vouchers SET is_active = FALSE
          WHERE is_active = TRUE AND expires_at < NOW();
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Deactivated % expired vouchers', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 7. fn_cleanup_old_notifications
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_cleanup_old_notifications(p_days INT DEFAULT 90)
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          DELETE FROM notifications
          WHERE is_read = TRUE AND created_at < NOW() - (p_days || ' days')::INTERVAL;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Cleaned up % old read notifications', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 8. fn_expire_flash_sales
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_expire_flash_sales()
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          UPDATE flash_sales SET status = 'ended'
          WHERE status = 'active' AND ends_at < NOW();
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Expired % flash sales', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 9. fn_activate_scheduled_flash_sales
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_activate_scheduled_flash_sales()
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          UPDATE flash_sales SET status = 'active'
          WHERE status = 'scheduled' AND starts_at <= NOW() AND ends_at > NOW();
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Activated % scheduled flash sales', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 10. fn_deactivate_expired_banners
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_deactivate_expired_banners()
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          UPDATE banners SET is_active = FALSE
          WHERE is_active = TRUE AND ends_at IS NOT NULL AND ends_at < NOW();
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Deactivated % expired banners', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 11. fn_close_stale_tickets
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_close_stale_tickets(p_days INT DEFAULT 14)
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          UPDATE tickets SET
              status = 'closed',
              resolved_at = NOW()
          WHERE status IN ('awaiting_customer', 'resolved')
            AND updated_at < NOW() - (p_days || ' days')::INTERVAL;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Closed % stale tickets', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 12. fn_escalate_sla_breached_tickets
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_escalate_sla_breached_tickets()
      RETURNS INT AS $$
      DECLARE
          v_count INT;
      BEGIN
          UPDATE tickets SET
              priority = 'urgent',
              is_escalated = TRUE
          WHERE status IN ('open', 'in_progress')
            AND is_escalated = FALSE
            AND sla_deadline IS NOT NULL
            AND sla_deadline < NOW();
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RAISE NOTICE 'Escalated % SLA-breached tickets', v_count;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 13. fn_daily_maintenance (master function)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_daily_maintenance()
      RETURNS VOID AS $$
      DECLARE
          v_result INT;
      BEGIN
          RAISE NOTICE '=== Daily Maintenance Started at % ===', NOW();

          SELECT fn_cleanup_expired_sessions() INTO v_result;
          SELECT fn_cleanup_abandoned_carts(30) INTO v_result;
          SELECT fn_cleanup_search_history(90) INTO v_result;
          SELECT fn_deactivate_expired_vouchers() INTO v_result;
          SELECT fn_cleanup_old_notifications(90) INTO v_result;
          SELECT fn_expire_flash_sales() INTO v_result;
          SELECT fn_activate_scheduled_flash_sales() INTO v_result;
          SELECT fn_deactivate_expired_banners() INTO v_result;
          SELECT fn_close_stale_tickets(14) INTO v_result;
          SELECT fn_escalate_sla_breached_tickets() INTO v_result;
          -- SELECT fn_expire_stock_reservations() INTO v_result; -- Function not defined
          -- SELECT fn_expire_loyalty_points() INTO v_result; -- Function not defined

          PERFORM fn_refresh_all_materialized_views();

          RAISE NOTICE '=== Daily Maintenance Completed at % ===', NOW();
      END;
      $$ LANGUAGE plpgsql
    `);

    // pg_cron schedule comments (for reference, requires pg_cron extension)
    // SELECT cron.schedule('refresh-hot-views', '*/15 * * * *', 'SELECT fn_refresh_hot_views()');
    // SELECT cron.schedule('refresh-all-views', '0 3 * * *', 'SELECT fn_refresh_all_materialized_views()');
    // SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT fn_daily_maintenance()');
    // SELECT cron.schedule('expire-reservations', '*/5 * * * *', 'SELECT fn_expire_stock_reservations()');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_daily_maintenance()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_escalate_sla_breached_tickets()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_close_stale_tickets(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_deactivate_expired_banners()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_activate_scheduled_flash_sales()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_expire_flash_sales()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_old_notifications(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_deactivate_expired_vouchers()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_search_history(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_abandoned_carts(INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_cleanup_expired_sessions()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_refresh_hot_views()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_refresh_all_materialized_views()`);
  }
}
