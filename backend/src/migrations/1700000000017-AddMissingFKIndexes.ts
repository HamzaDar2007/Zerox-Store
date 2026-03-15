import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingFKIndexes1700000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const indexes = [
      ['idx_stores_seller', 'stores', 'seller_id'],
      ['idx_coupon_scopes_coupon', 'coupon_scopes', 'coupon_id'],
      ['idx_coupon_scopes_user', 'coupon_scopes', 'user_id'],
      ['idx_coupon_scopes_product', 'coupon_scopes', 'product_id'],
      ['idx_coupon_scopes_category', 'coupon_scopes', 'category_id'],
      ['idx_wishlists_user', 'wishlists', 'user_id'],
      ['idx_carts_user', 'carts', 'user_id'],
      ['idx_carts_coupon', 'carts', 'coupon_id'],
      ['idx_orders_coupon', 'orders', 'coupon_id'],
      ['idx_order_items_variant', 'order_items', 'variant_id'],
      ['idx_order_items_store', 'order_items', 'store_id'],
      ['idx_order_items_flash_sale', 'order_items', 'flash_sale_id'],
      ['idx_payments_user', 'payments', 'user_id'],
      ['idx_coupon_usages_user', 'coupon_usages', 'user_id'],
      ['idx_coupon_usages_order', 'coupon_usages', 'order_id'],
      ['idx_subscriptions_plan', 'subscriptions', 'plan_id'],
      ['idx_returns_user', 'returns', 'user_id'],
      ['idx_return_items_return', 'return_items', 'return_id'],
      ['idx_return_items_order_item', 'return_items', 'order_item_id'],
      ['idx_product_images_variant', 'product_images', 'variant_id'],
      [
        'idx_variant_attr_vals_attr_val',
        'variant_attribute_values',
        'attribute_value_id',
      ],
      ['idx_shipping_methods_zone', 'shipping_methods', 'zone_id'],
      ['idx_shipments_warehouse', 'shipments', 'warehouse_id'],
      ['idx_shipments_shipping_method', 'shipments', 'shipping_method_id'],
      ['idx_chat_threads_order', 'chat_threads', 'order_id'],
      ['idx_chat_threads_product', 'chat_threads', 'product_id'],
      ['idx_chat_messages_sender', 'chat_messages', 'sender_id'],
      ['idx_search_queries_clicked', 'search_queries', 'clicked_product'],
    ];

    for (const [name, table, column] of indexes) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS ${name} ON ${table} (${column})`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const indexNames = [
      'idx_stores_seller',
      'idx_coupon_scopes_coupon',
      'idx_coupon_scopes_user',
      'idx_coupon_scopes_product',
      'idx_coupon_scopes_category',
      'idx_wishlists_user',
      'idx_carts_user',
      'idx_carts_coupon',
      'idx_orders_coupon',
      'idx_order_items_variant',
      'idx_order_items_store',
      'idx_order_items_flash_sale',
      'idx_payments_user',
      'idx_coupon_usages_user',
      'idx_coupon_usages_order',
      'idx_subscriptions_plan',
      'idx_returns_user',
      'idx_return_items_return',
      'idx_return_items_order_item',
      'idx_product_images_variant',
      'idx_variant_attr_vals_attr_val',
      'idx_shipping_methods_zone',
      'idx_shipments_warehouse',
      'idx_shipments_shipping_method',
      'idx_chat_threads_order',
      'idx_chat_threads_product',
      'idx_chat_messages_sender',
      'idx_search_queries_clicked',
    ];

    for (const name of indexNames) {
      await queryRunner.query(`DROP INDEX IF EXISTS ${name}`);
    }
  }
}
