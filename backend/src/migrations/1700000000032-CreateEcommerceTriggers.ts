import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceTriggers1700000000032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Auto-update product search vector
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_product_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.search_vector :=
              setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
              setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
              setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
              setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_products_search_vector
          BEFORE INSERT OR UPDATE OF name, short_description, description, tags ON products
          FOR EACH ROW EXECUTE FUNCTION fn_update_product_search_vector()
    `);

    // 2. Auto-update product avg_rating, total_ratings, total_reviews
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_product_rating()
      RETURNS TRIGGER AS $$
      DECLARE
          v_product_id UUID;
      BEGIN
          v_product_id := COALESCE(NEW.product_id, OLD.product_id);
          UPDATE products SET
              avg_rating = COALESCE((
                  SELECT ROUND(AVG(rating)::NUMERIC, 2)
                  FROM reviews
                  WHERE product_id = v_product_id AND moderation_status = 'approved' AND is_active = TRUE
              ), 0),
              total_ratings = (
                  SELECT COUNT(*)
                  FROM reviews
                  WHERE product_id = v_product_id AND moderation_status = 'approved' AND is_active = TRUE
              ),
              total_reviews = (
                  SELECT COUNT(*)
                  FROM reviews
                  WHERE product_id = v_product_id AND moderation_status = 'approved' AND is_active = TRUE AND body IS NOT NULL
              )
          WHERE id = v_product_id;
          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_review_update_product_rating
          AFTER INSERT OR UPDATE OF rating, moderation_status, is_active OR DELETE ON reviews
          FOR EACH ROW EXECUTE FUNCTION fn_update_product_rating()
    `);

    // 3. Update store rating
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_store_rating()
      RETURNS TRIGGER AS $$
      DECLARE
          v_seller_id UUID;
      BEGIN
          SELECT seller_id INTO v_seller_id FROM products WHERE id = COALESCE(NEW.product_id, OLD.product_id);
          IF v_seller_id IS NOT NULL THEN
              UPDATE stores SET rating = COALESCE((
                  SELECT ROUND(AVG(p.avg_rating)::NUMERIC, 2)
                  FROM products p
                  WHERE p.seller_id = v_seller_id AND p.avg_rating > 0 AND p.status = 'active'
              ), 0)
              WHERE seller_id = v_seller_id;
              UPDATE sellers SET avg_rating = COALESCE((
                  SELECT ROUND(AVG(p.avg_rating)::NUMERIC, 2)
                  FROM products p
                  WHERE p.seller_id = v_seller_id AND p.avg_rating > 0 AND p.status = 'active'
              ), 0)
              WHERE id = v_seller_id;
          END IF;
          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_review_update_store_rating
          AFTER INSERT OR UPDATE OF rating, moderation_status OR DELETE ON reviews
          FOR EACH ROW EXECUTE FUNCTION fn_update_store_rating()
    `);

    // 4. Track product price changes
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_track_product_price_change()
      RETURNS TRIGGER AS $$
      BEGIN
          IF OLD.price IS DISTINCT FROM NEW.price OR OLD.compare_at_price IS DISTINCT FROM NEW.compare_at_price THEN
              INSERT INTO price_history (product_id, variant_id, old_price, new_price, old_compare_at_price, new_compare_at_price, changed_by, created_at)
              VALUES (NEW.id, NULL, OLD.price, NEW.price, OLD.compare_at_price, NEW.compare_at_price, fn_current_user_id(), NOW());
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_products_price_change
          AFTER UPDATE OF price, compare_at_price ON products
          FOR EACH ROW EXECUTE FUNCTION fn_track_product_price_change()
    `);

    // 5. Track variant price changes
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_track_variant_price_change()
      RETURNS TRIGGER AS $$
      BEGIN
          IF OLD.price IS DISTINCT FROM NEW.price OR OLD.compare_at_price IS DISTINCT FROM NEW.compare_at_price THEN
              INSERT INTO price_history (product_id, variant_id, old_price, new_price, old_compare_at_price, new_compare_at_price, changed_by, created_at)
              VALUES (NEW.product_id, NEW.id, OLD.price, NEW.price, OLD.compare_at_price, NEW.compare_at_price, fn_current_user_id(), NOW());
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_variants_price_change
          AFTER UPDATE OF price, compare_at_price ON product_variants
          FOR EACH ROW EXECUTE FUNCTION fn_track_variant_price_change()
    `);

    // 6. Soft delete cascade for products
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_soft_delete_cascade_products()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
              UPDATE product_variants SET is_active = FALSE WHERE product_id = NEW.id;
              NEW.status := 'inactive';
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_products_soft_delete_cascade
          BEFORE UPDATE OF deleted_at ON products
          FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_cascade_products()
    `);

    // 7. Order status history tracking
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_track_order_status()
      RETURNS TRIGGER AS $$
      BEGIN
          IF OLD.status IS DISTINCT FROM NEW.status THEN
              INSERT INTO order_status_history (order_id, order_item_id, from_status, to_status, changed_by, created_at)
              VALUES (NEW.id, NULL, OLD.status::TEXT, NEW.status::TEXT, fn_current_user_id(), NOW());
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_orders_status_history
          AFTER UPDATE OF status ON orders
          FOR EACH ROW EXECUTE FUNCTION fn_track_order_status()
    `);

    // 8. Order item status history tracking
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_track_order_item_status()
      RETURNS TRIGGER AS $$
      BEGIN
          IF OLD.status IS DISTINCT FROM NEW.status THEN
              INSERT INTO order_status_history (order_id, order_item_id, from_status, to_status, changed_by, created_at)
              VALUES (NEW.order_id, NEW.id, OLD.status::TEXT, NEW.status::TEXT, fn_current_user_id(), NOW());
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_order_items_status_history
          AFTER UPDATE OF status ON order_items
          FOR EACH ROW EXECUTE FUNCTION fn_track_order_item_status()
    `);

    // 9. Review helpfulness count update
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_review_helpfulness()
      RETURNS TRIGGER AS $$
      DECLARE
          v_review_id UUID;
      BEGIN
          v_review_id := COALESCE(NEW.review_id, OLD.review_id);
          UPDATE reviews SET
              helpful_count = (SELECT COUNT(*) FROM review_helpfulness WHERE review_id = v_review_id AND is_helpful = TRUE),
              unhelpful_count = (SELECT COUNT(*) FROM review_helpfulness WHERE review_id = v_review_id AND is_helpful = FALSE)
          WHERE id = v_review_id;
          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_review_helpfulness_count
          AFTER INSERT OR UPDATE OR DELETE ON review_helpfulness
          FOR EACH ROW EXECUTE FUNCTION fn_update_review_helpfulness()
    `);

    // 10. Review report count update
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_review_report_count()
      RETURNS TRIGGER AS $$
      DECLARE
          v_review_id UUID;
      BEGIN
          v_review_id := COALESCE(NEW.review_id, OLD.review_id);
          UPDATE reviews SET
              reported_count = (SELECT COUNT(*) FROM review_reports WHERE review_id = v_review_id)
          WHERE id = v_review_id;
          UPDATE reviews SET moderation_status = 'flagged'
          WHERE id = v_review_id
            AND reported_count >= 3
            AND moderation_status = 'approved';
          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_review_report_count
          AFTER INSERT OR DELETE ON review_reports
          FOR EACH ROW EXECUTE FUNCTION fn_update_review_report_count()
    `);

    // 11. Conversation message stats update
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_conversation_stats()
      RETURNS TRIGGER AS $$
      DECLARE
          v_conv_id UUID;
          v_sender_id UUID;
          v_buyer_id UUID;
      BEGIN
          v_conv_id := NEW.conversation_id;
          v_sender_id := NEW.sender_id;
          SELECT buyer_id INTO v_buyer_id FROM conversations WHERE id = v_conv_id;
          UPDATE conversations SET
              message_count = message_count + 1,
              last_message_at = NEW.created_at,
              last_message_preview = LEFT(NEW.content, 200),
              last_message_sender_id = NEW.sender_id,
              unread_buyer_count = CASE WHEN v_sender_id != v_buyer_id THEN unread_buyer_count + 1 ELSE unread_buyer_count END,
              unread_seller_count = CASE WHEN v_sender_id = v_buyer_id THEN unread_seller_count + 1 ELSE unread_seller_count END
          WHERE id = v_conv_id;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_message_update_conversation
          AFTER INSERT ON messages
          FOR EACH ROW EXECUTE FUNCTION fn_update_conversation_stats()
    `);

    // 12. Voucher usage count update
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_increment_voucher_usage()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE vouchers SET used_count = used_count + 1 WHERE id = NEW.voucher_id;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_voucher_usage_increment
          AFTER INSERT ON voucher_usages
          FOR EACH ROW EXECUTE FUNCTION fn_increment_voucher_usage()
    `);

    // 13. Store followers count
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_store_followers()
      RETURNS TRIGGER AS $$
      DECLARE
          v_store_id UUID;
      BEGIN
          v_store_id := COALESCE(NEW.store_id, OLD.store_id);
          UPDATE stores SET total_followers = (
              SELECT COUNT(*) FROM store_followers WHERE store_id = v_store_id
          ) WHERE id = v_store_id;
          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_store_followers_count
          AFTER INSERT OR DELETE ON store_followers
          FOR EACH ROW EXECUTE FUNCTION fn_update_store_followers()
    `);

    // 14. Product question count
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_product_question_count()
      RETURNS TRIGGER AS $$
      DECLARE
          v_product_id UUID;
      BEGIN
          v_product_id := COALESCE(NEW.product_id, OLD.product_id);
          UPDATE products SET total_questions = (
              SELECT COUNT(*) FROM product_questions WHERE product_id = v_product_id AND is_approved = TRUE
          ) WHERE id = v_product_id;
          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trg_product_question_count
          AFTER INSERT OR UPDATE OF is_approved OR DELETE ON product_questions
          FOR EACH ROW EXECUTE FUNCTION fn_update_product_question_count()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_product_question_count ON product_questions`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_update_product_question_count()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_store_followers_count ON store_followers`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_update_store_followers()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_voucher_usage_increment ON voucher_usages`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_increment_voucher_usage()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_message_update_conversation ON messages`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_update_conversation_stats()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_review_report_count ON review_reports`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_update_review_report_count()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_review_helpfulness_count ON review_helpfulness`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_update_review_helpfulness()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_order_items_status_history ON order_items`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_track_order_item_status()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_orders_status_history ON orders`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_track_order_status()`);

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_products_soft_delete_cascade ON products`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_soft_delete_cascade_products()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_variants_price_change ON product_variants`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_track_variant_price_change()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_products_price_change ON products`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_track_product_price_change()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_review_update_store_rating ON reviews`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_update_store_rating()`);

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_review_update_product_rating ON reviews`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_update_product_rating()`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_products_search_vector ON products`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS fn_update_product_search_vector()`,
    );
  }
}
