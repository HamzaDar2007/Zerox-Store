import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceIndexes1700000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Auth & Access ──
    await queryRunner.query(
      `CREATE INDEX idx_user_roles_user ON user_roles(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_auth_tokens_user ON auth_tokens(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_user_addresses_user ON user_addresses(user_id)`,
    );

    // ── Catalog ──
    await queryRunner.query(
      `CREATE INDEX idx_products_store ON products(store_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_products_category ON products(category_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_products_brand ON products(brand_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_variants_product ON product_variants(product_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_product_images_product ON product_images(product_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_categories_parent ON categories(parent_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_reviews_product ON reviews(product_id)`,
    );

    // ── Commerce ──
    await queryRunner.query(
      `CREATE INDEX idx_cart_items_cart ON cart_items(cart_id)`,
    );
    await queryRunner.query(`CREATE INDEX idx_orders_user ON orders(user_id)`);
    await queryRunner.query(
      `CREATE INDEX idx_order_items_order ON order_items(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_payments_order ON payments(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_returns_order ON returns(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_subscriptions_user ON subscriptions(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_payments_metadata ON payments USING GIN (metadata)`,
    );

    // ── Logistics ──
    await queryRunner.query(
      `CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_inventory_variant ON inventory(variant_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_shipments_order ON shipments(order_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_shipment_events_ship ON shipment_events(shipment_id)`,
    );

    // ── Communication ──
    await queryRunner.query(
      `CREATE INDEX idx_notifications_user ON notifications(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_notifications_channel ON notifications(channel)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_search_queries_user ON search_queries(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_notifications_meta ON notifications USING GIN (metadata)`,
    );

    // ── Analytics & Admin ──
    await queryRunner.query(
      `CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audit_logs_occurred ON audit_logs(occurred_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audit_logs_diff ON audit_logs USING GIN (diff)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── Analytics & Admin ──
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_diff`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_occurred`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_table`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_actor`);

    // ── Communication ──
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_meta`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_search_queries_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_chat_messages_thread`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_channel`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user`);

    // ── Logistics ──
    await queryRunner.query(`DROP INDEX IF EXISTS idx_shipment_events_ship`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_shipments_order`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inventory_variant`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inventory_warehouse`);

    // ── Commerce ──
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_metadata`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subscriptions_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coupon_usages_coupon`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_returns_order`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_order`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_order_items_order`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_cart_items_cart`);

    // ── Catalog ──
    await queryRunner.query(`DROP INDEX IF EXISTS idx_reviews_product`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_categories_parent`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_images_product`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_variants_product`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_brand`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_category`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_store`);

    // ── Auth & Access ──
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_addresses_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_auth_tokens_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_auth_sessions_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_roles_user`);
  }
}
