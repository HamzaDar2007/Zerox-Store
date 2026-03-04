import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceStoredProcedures1700000000033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. sp_place_order
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_place_order(
          p_checkout_session_id UUID,
          p_payment_method payment_method_enum DEFAULT 'cod'
      ) RETURNS TABLE(order_id UUID, order_number VARCHAR) AS $$
      DECLARE
          v_session RECORD;
          v_order_id UUID;
          v_order_number VARCHAR(30);
          v_cart_item RECORD;
          v_available INT;
          v_subtotal NUMERIC(12,2) := 0;
          v_total NUMERIC(12,2) := 0;
          v_discount NUMERIC(12,2) := 0;
          v_tax NUMERIC(12,2) := 0;
          v_shipping_cost NUMERIC(12,2) := 0;
          v_commission NUMERIC(12,2);
          v_item_total NUMERIC(12,2);
          v_snapshot JSONB;
      BEGIN
          SELECT cs.* INTO v_session
          FROM checkout_sessions cs
          WHERE cs.id = p_checkout_session_id AND cs.status = 'active'
          FOR UPDATE;

          IF v_session IS NULL THEN
              RAISE EXCEPTION 'Checkout session not found or already completed: %', p_checkout_session_id;
          END IF;

          IF v_session.price_lock_expires_at < NOW() THEN
              RAISE EXCEPTION 'Price lock expired for checkout session: %', p_checkout_session_id;
          END IF;

          v_order_number := fn_generate_order_number();

          FOR v_cart_item IN
              SELECT ci.*, p.name AS product_name, p.price, p.seller_id,
                     COALESCE(pv.price, p.price) AS effective_price,
                     COALESCE(pv.sku, p.sku) AS effective_sku
              FROM cart_items ci
              JOIN products p ON p.id = ci.product_id
              LEFT JOIN product_variants pv ON pv.id = ci.variant_id
              WHERE ci.cart_id = v_session.cart_id
              FOR UPDATE OF ci
          LOOP
              SELECT COALESCE(SUM(quantity_available), 0) INTO v_available
              FROM inventory
              WHERE product_id = v_cart_item.product_id
                AND (v_cart_item.variant_id IS NULL OR variant_id = v_cart_item.variant_id);

              IF v_available < v_cart_item.quantity THEN
                  RAISE EXCEPTION 'Insufficient stock for product "%". Available: %, Requested: %',
                      v_cart_item.product_name, v_available, v_cart_item.quantity;
              END IF;

              v_item_total := v_cart_item.effective_price * v_cart_item.quantity;
              v_subtotal := v_subtotal + v_item_total;
          END LOOP;

          IF v_session.voucher_id IS NOT NULL THEN
              SELECT CASE
                  WHEN v.type = 'percentage' THEN LEAST(v_subtotal * v.discount_value / 100, COALESCE(v.max_discount, v_subtotal))
                  ELSE LEAST(v.discount_value, v_subtotal)
              END INTO v_discount
              FROM vouchers v WHERE v.id = v_session.voucher_id AND v.is_active = TRUE;
              v_discount := COALESCE(v_discount, 0);
          END IF;

          v_shipping_cost := COALESCE(v_session.shipping_cost, 0);
          v_tax := COALESCE(v_session.tax_amount, 0);
          v_total := v_subtotal - v_discount + v_shipping_cost + v_tax;

          INSERT INTO orders (
              order_number, user_id, address_id,
              subtotal, discount_amount, delivery_charges, tax_amount, total_amount,
              payment_method, voucher_id, status,
              loyalty_points_earned, loyalty_points_used, loyalty_discount,
              customer_notes
          ) VALUES (
              v_order_number, v_session.user_id, v_session.shipping_address_id,
              v_subtotal, v_discount, v_shipping_cost, v_tax, v_total,
              p_payment_method, v_session.voucher_id, 'pending',
              FLOOR(v_total / 100)::INT,
              COALESCE(v_session.loyalty_points_redeemed, 0),
              COALESCE(v_session.loyalty_points_discount, 0),
              NULL
          )
          RETURNING id INTO v_order_id;

          FOR v_cart_item IN
              SELECT ci.*, p.name AS product_name, p.price AS base_price, p.seller_id,
                     COALESCE(pv.price, p.price) AS unit_price,
                     COALESCE(pv.sku, p.sku) AS item_sku,
                     COALESCE(cat.commission_rate, 5.00) AS commission_rate
              FROM cart_items ci
              JOIN products p ON p.id = ci.product_id
              LEFT JOIN product_variants pv ON pv.id = ci.variant_id
              LEFT JOIN categories cat ON cat.id = p.category_id
              WHERE ci.cart_id = v_session.cart_id
          LOOP
              v_item_total := v_cart_item.unit_price * v_cart_item.quantity;
              v_commission := v_item_total * v_cart_item.commission_rate / 100;

              INSERT INTO order_items (
                  order_id, product_id, variant_id, seller_id,
                  product_name, sku, unit_price, quantity, total_price,
                  discount_amount, tax_amount, status,
                  commission_rate, commission_amount, seller_amount
              ) VALUES (
                  v_order_id, v_cart_item.product_id, v_cart_item.variant_id, v_cart_item.seller_id,
                  v_cart_item.product_name, v_cart_item.item_sku, v_cart_item.unit_price, v_cart_item.quantity, v_item_total,
                  0, 0, 'pending',
                  v_cart_item.commission_rate, v_commission, v_item_total - v_commission
              );

              UPDATE inventory SET
                  quantity_in = quantity_in,
                  quantity_reserved = quantity_reserved + v_cart_item.quantity
              WHERE product_id = v_cart_item.product_id
                AND (v_cart_item.variant_id IS NULL OR variant_id = v_cart_item.variant_id)
                AND quantity_available >= v_cart_item.quantity;

              IF NOT FOUND THEN
                  RAISE EXCEPTION 'Stock deduction race condition for product: %', v_cart_item.product_name;
              END IF;

              UPDATE products SET total_sold = total_sold + v_cart_item.quantity WHERE id = v_cart_item.product_id;
          END LOOP;

          SELECT jsonb_build_object(
              'order_number', v_order_number,
              'items', (SELECT jsonb_agg(row_to_json(oi)) FROM order_items oi WHERE oi.order_id = v_order_id),
              'subtotal', v_subtotal, 'discount', v_discount,
              'shipping', v_shipping_cost, 'tax', v_tax, 'total', v_total,
              'payment_method', p_payment_method::TEXT
          ) INTO v_snapshot;

          INSERT INTO order_snapshots (order_id, snapshot_type, data)
          VALUES (v_order_id, 'creation', v_snapshot);

          IF v_session.voucher_id IS NOT NULL THEN
              INSERT INTO voucher_usages (voucher_id, user_id, order_id, discount_amount)
              VALUES (v_session.voucher_id, v_session.user_id, v_order_id, v_discount);
          END IF;

          UPDATE checkout_sessions SET status = 'completed', completed_at = NOW() WHERE id = p_checkout_session_id;

          DELETE FROM cart_items WHERE cart_id = v_session.cart_id;
          UPDATE carts SET item_count = 0, subtotal = 0, updated_at = NOW() WHERE id = v_session.cart_id;

          INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
          VALUES (v_order_id, NULL, 'pending', v_session.user_id);

          RETURN QUERY SELECT v_order_id, v_order_number;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 2. sp_process_refund
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_process_refund(
          p_order_id UUID,
          p_order_item_id UUID DEFAULT NULL,
          p_amount NUMERIC(12,2) DEFAULT NULL,
          p_reason TEXT DEFAULT 'Customer requested',
          p_refund_method refund_method_enum DEFAULT 'original_payment',
          p_initiated_by UUID DEFAULT NULL
      ) RETURNS UUID AS $$
      DECLARE
          v_order RECORD;
          v_payment RECORD;
          v_refund_id UUID;
          v_refund_number VARCHAR(30);
          v_refund_amount NUMERIC(12,2);
          v_already_refunded NUMERIC(12,2);
          v_max_refundable NUMERIC(12,2);
      BEGIN
          SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
          IF v_order IS NULL THEN
              RAISE EXCEPTION 'Order not found: %', p_order_id;
          END IF;

          SELECT * INTO v_payment FROM payments WHERE order_id = p_order_id AND status = 'completed' ORDER BY created_at DESC LIMIT 1;
          IF v_payment IS NULL THEN
              RAISE EXCEPTION 'No completed payment found for order: %', p_order_id;
          END IF;

          IF p_order_item_id IS NOT NULL THEN
              SELECT total_price INTO v_max_refundable FROM order_items WHERE id = p_order_item_id AND order_id = p_order_id;
              IF v_max_refundable IS NULL THEN
                  RAISE EXCEPTION 'Order item not found: %', p_order_item_id;
              END IF;
          ELSE
              v_max_refundable := v_order.total_amount;
          END IF;

          v_refund_amount := COALESCE(p_amount, v_max_refundable);

          SELECT COALESCE(SUM(amount), 0) INTO v_already_refunded
          FROM refunds WHERE order_id = p_order_id AND status NOT IN ('rejected', 'cancelled');

          IF v_already_refunded + v_refund_amount > v_order.total_amount THEN
              RAISE EXCEPTION 'Refund exceeds order total. Already refunded: %, Requested: %, Order total: %',
                  v_already_refunded, v_refund_amount, v_order.total_amount;
          END IF;

          v_refund_number := fn_generate_refund_number();

          INSERT INTO refunds (
              refund_number, order_id, order_item_id, payment_id,
              amount, reason, refund_method, status, initiated_by
          ) VALUES (
              v_refund_number, p_order_id, p_order_item_id, v_payment.id,
              v_refund_amount, p_reason, p_refund_method, 'pending', COALESCE(p_initiated_by, fn_current_user_id())
          )
          RETURNING id INTO v_refund_id;

          UPDATE orders SET
              refund_amount = v_already_refunded + v_refund_amount,
              status = CASE
                  WHEN v_already_refunded + v_refund_amount >= total_amount THEN 'refunded'::order_status_enum
                  ELSE 'partially_refunded'::order_status_enum
              END
          WHERE id = p_order_id;

          IF p_refund_method = 'wallet_credit' THEN
              UPDATE seller_wallets SET balance = balance + v_refund_amount
              WHERE seller_id = (SELECT user_id FROM orders WHERE id = p_order_id);
          END IF;

          RETURN v_refund_id;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 3. sp_cancel_order
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_cancel_order(
          p_order_id UUID,
          p_cancel_reason TEXT DEFAULT 'Customer requested',
          p_cancelled_by UUID DEFAULT NULL
      ) RETURNS BOOLEAN AS $$
      DECLARE
          v_order RECORD;
          v_item RECORD;
      BEGIN
          SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
          IF v_order IS NULL THEN
              RAISE EXCEPTION 'Order not found: %', p_order_id;
          END IF;

          IF v_order.status NOT IN ('pending', 'confirmed', 'processing') THEN
              RAISE EXCEPTION 'Cannot cancel order in status: %', v_order.status;
          END IF;

          FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id
          LOOP
              UPDATE inventory SET
                  quantity_reserved = GREATEST(quantity_reserved - v_item.quantity, 0)
              WHERE product_id = v_item.product_id
                AND (v_item.variant_id IS NULL OR variant_id = v_item.variant_id);

              UPDATE products SET total_sold = GREATEST(total_sold - v_item.quantity, 0) WHERE id = v_item.product_id;
              UPDATE order_items SET status = 'cancelled' WHERE id = v_item.id;
          END LOOP;

          UPDATE orders SET
              status = 'cancelled',
              cancelled_at = NOW(),
              cancellation_reason = p_cancel_reason,
              cancelled_by = COALESCE(p_cancelled_by, fn_current_user_id())
          WHERE id = p_order_id;

          IF v_order.voucher_id IS NOT NULL THEN
              DELETE FROM voucher_usages WHERE order_id = p_order_id;
              UPDATE vouchers SET used_count = GREATEST(used_count - 1, 0) WHERE id = v_order.voucher_id;
          END IF;

          IF v_order.loyalty_points_earned > 0 THEN
              INSERT INTO loyalty_transactions (user_id, type, points, balance_after, reference_type, reference_id, description)
              VALUES (v_order.user_id, 'refund_reversal', -v_order.loyalty_points_earned,
                  (SELECT available_balance FROM loyalty_points WHERE user_id = v_order.user_id) - v_order.loyalty_points_earned,
                  'order_cancellation', p_order_id, 'Points reversed due to order cancellation');

              UPDATE loyalty_points SET available_balance = available_balance - v_order.loyalty_points_earned WHERE user_id = v_order.user_id;
          END IF;

          RETURN TRUE;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 4. sp_commit_order_stock
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_commit_order_stock(p_order_id UUID)
      RETURNS BOOLEAN AS $$
      DECLARE
          v_item RECORD;
      BEGIN
          FOR v_item IN
              SELECT * FROM order_items WHERE order_id = p_order_id AND status = 'pending'
          LOOP
              UPDATE inventory SET
                  quantity_reserved = GREATEST(quantity_reserved - v_item.quantity, 0),
                  quantity_out = quantity_out + v_item.quantity
              WHERE product_id = v_item.product_id
                AND (v_item.variant_id IS NULL OR variant_id = v_item.variant_id);

              INSERT INTO stock_movements (inventory_id, movement_type, quantity, reference_type, reference_id, notes)
              SELECT i.id, 'sale', -v_item.quantity, 'order', p_order_id, 'Order confirmed'
              FROM inventory i
              WHERE i.product_id = v_item.product_id
                AND (v_item.variant_id IS NULL OR i.variant_id = v_item.variant_id)
              LIMIT 1;

              UPDATE order_items SET status = 'confirmed' WHERE id = v_item.id;
          END LOOP;

          UPDATE orders SET status = 'confirmed' WHERE id = p_order_id AND status = 'pending';
          RETURN TRUE;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 5. sp_calculate_seller_payout
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_calculate_seller_payout(p_order_id UUID)
      RETURNS TABLE(seller_id UUID, payout_amount NUMERIC) AS $$
      BEGIN
          RETURN QUERY
          WITH seller_totals AS (
              SELECT
                  oi.seller_id,
                  SUM(oi.total_price) AS gross_amount,
                  SUM(oi.commission_amount) AS commission,
                  SUM(oi.total_price) - SUM(oi.commission_amount) AS net_amount
              FROM order_items oi
              WHERE oi.order_id = p_order_id AND oi.status NOT IN ('cancelled', 'returned')
              GROUP BY oi.seller_id
          )
          SELECT st.seller_id, st.net_amount
          FROM seller_totals st;

          INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, reference_type, reference_id, description, status)
          SELECT
              sw.id, 'credit', st.net_amount, 'order', p_order_id,
              'Payout for order ' || (SELECT order_number FROM orders WHERE id = p_order_id),
              'completed'
          FROM (
              SELECT oi.seller_id, SUM(oi.total_price) - SUM(oi.commission_amount) AS net_amount
              FROM order_items oi
              WHERE oi.order_id = p_order_id AND oi.status NOT IN ('cancelled', 'returned')
              GROUP BY oi.seller_id
          ) st
          JOIN seller_wallets sw ON sw.seller_id = st.seller_id;

          UPDATE seller_wallets SET
              balance = balance + sub.net_amount,
              total_earned = total_earned + sub.net_amount
          FROM (
              SELECT oi.seller_id, SUM(oi.total_price) - SUM(oi.commission_amount) AS net_amount
              FROM order_items oi
              WHERE oi.order_id = p_order_id AND oi.status NOT IN ('cancelled', 'returned')
              GROUP BY oi.seller_id
          ) sub
          WHERE seller_wallets.seller_id = sub.seller_id;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 6. sp_expire_stock_reservations
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_expire_stock_reservations()
      RETURNS INT AS $$
      DECLARE
          v_reservation RECORD;
          v_count INT := 0;
      BEGIN
          FOR v_reservation IN
              SELECT * FROM stock_reservations
              WHERE status = 'held' AND expires_at < NOW()
              FOR UPDATE SKIP LOCKED
          LOOP
              UPDATE inventory SET
                  quantity_reserved = GREATEST(quantity_reserved - v_reservation.quantity, 0)
              WHERE id = v_reservation.inventory_id;
              UPDATE stock_reservations SET status = 'expired', released_at = NOW() WHERE id = v_reservation.id;
              v_count := v_count + 1;
          END LOOP;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 7. sp_expire_loyalty_points
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_expire_loyalty_points()
      RETURNS INT AS $$
      DECLARE
          v_tx RECORD;
          v_count INT := 0;
      BEGIN
          FOR v_tx IN
              SELECT lt.id, lt.user_id, lt.points
              FROM loyalty_transactions lt
              WHERE lt.type = 'earned' AND lt.expires_at IS NOT NULL AND lt.expires_at < NOW()
                AND lt.points > 0
              FOR UPDATE SKIP LOCKED
          LOOP
              INSERT INTO loyalty_transactions (user_id, type, points, balance_after, reference_type, reference_id, description, created_at)
              VALUES (v_tx.user_id, 'expired', -v_tx.points,
                  (SELECT available_balance FROM loyalty_points WHERE user_id = v_tx.user_id) - v_tx.points,
                  'system', v_tx.id, 'Points expired', NOW());

              UPDATE loyalty_points SET
                  available_balance = GREATEST(available_balance - v_tx.points, 0),
                  total_expired = total_expired + v_tx.points
              WHERE user_id = v_tx.user_id;

              UPDATE loyalty_transactions SET points = 0 WHERE id = v_tx.id;
              v_count := v_count + 1;
          END LOOP;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 8. sp_generate_subscription_orders
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_generate_subscription_orders()
      RETURNS INT AS $$
      DECLARE
          v_sub RECORD;
          v_order_id UUID;
          v_order_number VARCHAR(30);
          v_count INT := 0;
      BEGIN
          FOR v_sub IN
              SELECT s.*, p.name AS product_name, p.price, p.seller_id,
                     COALESCE(cat.commission_rate, 5.00) AS cat_commission_rate
              FROM subscriptions s
              JOIN products p ON p.id = s.product_id
              LEFT JOIN categories cat ON cat.id = p.category_id
              WHERE s.status = 'active' AND s.next_delivery_date <= CURRENT_DATE
              FOR UPDATE OF s SKIP LOCKED
          LOOP
              v_order_number := fn_generate_order_number();

              INSERT INTO orders (
                  order_number, user_id, address_id,
                  subtotal, total_amount, payment_method, status, customer_notes
              ) VALUES (
                  v_order_number, v_sub.user_id, v_sub.delivery_address_id,
                  v_sub.unit_price * v_sub.quantity, v_sub.unit_price * v_sub.quantity,
                  'cod', 'pending', 'Auto-generated from subscription'
              )
              RETURNING id INTO v_order_id;

              INSERT INTO order_items (
                  order_id, product_id, variant_id, seller_id,
                  product_name, unit_price, quantity, total_price, status,
                  commission_rate, commission_amount, seller_amount
              ) VALUES (
                  v_order_id, v_sub.product_id, v_sub.variant_id, v_sub.seller_id,
                  v_sub.product_name, v_sub.unit_price, v_sub.quantity,
                  v_sub.unit_price * v_sub.quantity,
                  'pending',
                  v_sub.cat_commission_rate, v_sub.unit_price * v_sub.quantity * v_sub.cat_commission_rate / 100,
                  v_sub.unit_price * v_sub.quantity * (100 - v_sub.cat_commission_rate) / 100
              );

              INSERT INTO subscription_orders (subscription_id, order_id, scheduled_date)
              VALUES (v_sub.id, v_order_id, v_sub.next_delivery_date);

              UPDATE subscriptions SET
                  next_delivery_date = CASE v_sub.frequency
                      WHEN 'weekly' THEN v_sub.next_delivery_date + INTERVAL '7 days'
                      WHEN 'biweekly' THEN v_sub.next_delivery_date + INTERVAL '14 days'
                      WHEN 'monthly' THEN v_sub.next_delivery_date + INTERVAL '1 month'
                      WHEN 'quarterly' THEN v_sub.next_delivery_date + INTERVAL '3 months'
                  END,
                  total_orders = total_orders + 1,
                  last_order_date = NOW()
              WHERE id = v_sub.id;

              v_count := v_count + 1;
          END LOOP;
          RETURN v_count;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 9. fn_reserve_flash_sale_stock
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_reserve_flash_sale_stock(
          p_flash_sale_product_id UUID,
          p_user_id UUID,
          p_quantity INT DEFAULT 1
      ) RETURNS BOOLEAN AS $$
      DECLARE
          v_fsp RECORD;
          v_lock_key BIGINT;
      BEGIN
          v_lock_key := ('x' || LEFT(p_flash_sale_product_id::TEXT, 15))::BIT(64)::BIGINT;
          PERFORM pg_advisory_xact_lock(v_lock_key);

          SELECT * INTO v_fsp FROM flash_sale_products
          WHERE id = p_flash_sale_product_id
          FOR UPDATE;

          IF v_fsp IS NULL OR v_fsp.sold_count + p_quantity > v_fsp.stock_limit THEN
              RETURN FALSE;
          END IF;

          IF v_fsp.per_user_limit IS NOT NULL THEN
              IF (
                  SELECT COALESCE(SUM(oi.quantity), 0)
                  FROM order_items oi
                  JOIN orders o ON o.id = oi.order_id
                  WHERE oi.product_id = v_fsp.product_id
                    AND o.user_id = p_user_id
                    AND o.status NOT IN ('cancelled', 'refunded')
              ) + p_quantity > v_fsp.per_user_limit THEN
                  RETURN FALSE;
              END IF;
          END IF;

          UPDATE flash_sale_products SET sold_count = sold_count + p_quantity WHERE id = p_flash_sale_product_id;
          RETURN TRUE;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 10. fn_wallet_debit
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_wallet_debit(
          p_wallet_id UUID,
          p_amount NUMERIC(12,2),
          p_reference_type VARCHAR(50),
          p_reference_id UUID,
          p_description TEXT DEFAULT NULL
      ) RETURNS UUID AS $$
      DECLARE
          v_wallet RECORD;
          v_txn_id UUID;
      BEGIN
          SELECT * INTO v_wallet FROM seller_wallets WHERE id = p_wallet_id FOR UPDATE;
          IF v_wallet IS NULL THEN
              RAISE EXCEPTION 'Wallet not found: %', p_wallet_id;
          END IF;
          IF v_wallet.balance < p_amount THEN
              RAISE EXCEPTION 'Insufficient wallet balance. Available: %, Requested: %', v_wallet.balance, p_amount;
          END IF;

          UPDATE seller_wallets SET
              balance = balance - p_amount,
              total_withdrawn = total_withdrawn + p_amount
          WHERE id = p_wallet_id;

          INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, reference_type, reference_id, description, status, balance_after)
          VALUES (p_wallet_id, 'debit', p_amount, p_reference_type, p_reference_id, p_description, 'completed', v_wallet.balance - p_amount)
          RETURNING id INTO v_txn_id;

          RETURN v_txn_id;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 11. sp_apply_voucher
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_apply_voucher(
          p_voucher_code VARCHAR(50),
          p_user_id UUID,
          p_checkout_session_id UUID
      ) RETURNS TABLE(voucher_id UUID, discount_amount NUMERIC) AS $$
      DECLARE
          v_voucher RECORD;
          v_session RECORD;
          v_user_usage_count INT;
          v_discount NUMERIC(12,2);
      BEGIN
          SELECT * INTO v_voucher FROM vouchers
          WHERE code = UPPER(TRIM(p_voucher_code)) AND is_active = TRUE;

          IF v_voucher IS NULL THEN
              RAISE EXCEPTION 'Invalid voucher code: %', p_voucher_code;
          END IF;

          IF v_voucher.starts_at > NOW() OR v_voucher.expires_at < NOW() THEN
              RAISE EXCEPTION 'Voucher is not currently valid';
          END IF;

          IF v_voucher.total_limit IS NOT NULL AND v_voucher.used_count >= v_voucher.total_limit THEN
              RAISE EXCEPTION 'Voucher usage limit reached';
          END IF;

          SELECT COUNT(*) INTO v_user_usage_count FROM voucher_usages WHERE voucher_id = v_voucher.id AND user_id = p_user_id;
          IF v_voucher.per_user_limit IS NOT NULL AND v_user_usage_count >= v_voucher.per_user_limit THEN
              RAISE EXCEPTION 'You have already used this voucher the maximum number of times';
          END IF;

          IF v_voucher.first_order_only = TRUE THEN
              IF EXISTS (SELECT 1 FROM orders WHERE user_id = p_user_id AND status != 'cancelled') THEN
                  RAISE EXCEPTION 'This voucher is only valid for first-time orders';
              END IF;
          END IF;

          SELECT * INTO v_session FROM checkout_sessions WHERE id = p_checkout_session_id AND user_id = p_user_id;

          IF v_voucher.min_order_amount IS NOT NULL AND v_session.subtotal < v_voucher.min_order_amount THEN
              RAISE EXCEPTION 'Minimum order amount of % not met', v_voucher.min_order_amount;
          END IF;

          v_discount := CASE
              WHEN v_voucher.type = 'percentage' THEN LEAST(v_session.subtotal * v_voucher.discount_value / 100, COALESCE(v_voucher.max_discount, v_session.subtotal))
              ELSE LEAST(v_voucher.discount_value, v_session.subtotal)
          END;

          UPDATE checkout_sessions SET
              voucher_id = v_voucher.id,
              voucher_code = v_voucher.code,
              voucher_discount = v_discount
          WHERE id = p_checkout_session_id;

          RETURN QUERY SELECT v_voucher.id, v_discount;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 12. sp_merge_guest_cart
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sp_merge_guest_cart(
          p_session_id VARCHAR(255),
          p_user_id UUID
      ) RETURNS UUID AS $$
      DECLARE
          v_guest_cart RECORD;
          v_user_cart RECORD;
          v_guest_item RECORD;
      BEGIN
          SELECT * INTO v_guest_cart FROM carts WHERE session_id = p_session_id AND user_id IS NULL;
          IF v_guest_cart IS NULL THEN
              INSERT INTO carts (user_id) VALUES (p_user_id)
              ON CONFLICT DO NOTHING;
              SELECT id INTO v_user_cart FROM carts WHERE user_id = p_user_id LIMIT 1;
              RETURN v_user_cart.id;
          END IF;

          SELECT * INTO v_user_cart FROM carts WHERE user_id = p_user_id;
          IF v_user_cart IS NULL THEN
              UPDATE carts SET user_id = p_user_id, session_id = NULL WHERE id = v_guest_cart.id;
              RETURN v_guest_cart.id;
          END IF;

          FOR v_guest_item IN SELECT * FROM cart_items WHERE cart_id = v_guest_cart.id
          LOOP
              INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price)
              VALUES (v_user_cart.id, v_guest_item.product_id, v_guest_item.variant_id, v_guest_item.quantity, v_guest_item.unit_price)
              ON CONFLICT (cart_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID))
                  DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;
          END LOOP;

          UPDATE carts SET
              item_count = (SELECT COALESCE(SUM(quantity), 0) FROM cart_items WHERE cart_id = v_user_cart.id),
              subtotal = (SELECT COALESCE(SUM(unit_price * quantity), 0) FROM cart_items WHERE cart_id = v_user_cart.id)
          WHERE id = v_user_cart.id;

          DELETE FROM cart_items WHERE cart_id = v_guest_cart.id;
          DELETE FROM carts WHERE id = v_guest_cart.id;

          RETURN v_user_cart.id;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 13. Row-Level Security Policies
    await queryRunner.query(`ALTER TABLE addresses ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY addresses_user_policy ON addresses USING (user_id = fn_current_user_id()) WITH CHECK (user_id = fn_current_user_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE orders ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY orders_buyer_policy ON orders FOR SELECT USING (user_id = fn_current_user_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE order_items ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY order_items_seller_policy ON order_items FOR SELECT USING (seller_id = fn_current_seller_id() OR order_id IN (SELECT id FROM orders WHERE user_id = fn_current_user_id())); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE seller_wallets ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY wallet_owner_policy ON seller_wallets USING (seller_id = fn_current_seller_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY saved_payments_user_policy ON saved_payment_methods USING (user_id = fn_current_user_id()) WITH CHECK (user_id = fn_current_user_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY wishlists_user_policy ON wishlists USING (user_id = fn_current_user_id()) WITH CHECK (user_id = fn_current_user_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE sessions ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY sessions_user_policy ON sessions USING (user_id = fn_current_user_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE notifications ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY notifications_user_policy ON notifications FOR SELECT USING (user_id = fn_current_user_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    await queryRunner.query(`ALTER TABLE login_history ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`DO $$ BEGIN CREATE POLICY login_history_user_policy ON login_history FOR SELECT USING (user_id = fn_current_user_id()); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS login_history_user_policy ON login_history`);
    await queryRunner.query(`ALTER TABLE login_history DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS notifications_user_policy ON notifications`);
    await queryRunner.query(`ALTER TABLE notifications DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS sessions_user_policy ON sessions`);
    await queryRunner.query(`ALTER TABLE sessions DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS wishlists_user_policy ON wishlists`);
    await queryRunner.query(`ALTER TABLE wishlists DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS saved_payments_user_policy ON saved_payment_methods`);
    await queryRunner.query(`ALTER TABLE saved_payment_methods DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS wallet_owner_policy ON seller_wallets`);
    await queryRunner.query(`ALTER TABLE seller_wallets DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS order_items_seller_policy ON order_items`);
    await queryRunner.query(`ALTER TABLE order_items DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS orders_buyer_policy ON orders`);
    await queryRunner.query(`ALTER TABLE orders DISABLE ROW LEVEL SECURITY`);

    await queryRunner.query(`DROP POLICY IF EXISTS addresses_user_policy ON addresses`);
    await queryRunner.query(`ALTER TABLE addresses DISABLE ROW LEVEL SECURITY`);

    // Drop stored procedures
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_merge_guest_cart(VARCHAR, UUID)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_apply_voucher(VARCHAR, UUID, UUID)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_wallet_debit(UUID, NUMERIC, VARCHAR, UUID, TEXT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_reserve_flash_sale_stock(UUID, UUID, INT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_generate_subscription_orders()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_expire_loyalty_points()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_expire_stock_reservations()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_calculate_seller_payout(UUID)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_commit_order_stock(UUID)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_cancel_order(UUID, TEXT, UUID)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_process_refund(UUID, UUID, NUMERIC, TEXT, refund_method_enum, UUID)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS sp_place_order(UUID, payment_method_enum)`);
  }
}
