export enum ImportJobType {
  PRODUCT_IMPORT = 'product_import',
  PRODUCT_EXPORT = 'product_export',
  ORDER_EXPORT = 'order_export',
  INVENTORY_IMPORT = 'inventory_import',
  INVENTORY_EXPORT = 'inventory_export',
  CUSTOMER_EXPORT = 'customer_export',
  REVIEW_EXPORT = 'review_export',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum BulkOperationType {
  PRICE_UPDATE = 'price_update',
  STOCK_UPDATE = 'stock_update',
  STATUS_UPDATE = 'status_update',
  CATEGORY_UPDATE = 'category_update',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}
