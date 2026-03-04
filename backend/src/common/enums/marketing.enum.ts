export enum VoucherType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
}

export enum VoucherScope {
  ALL = 'all',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  SPECIFIC_BRANDS = 'specific_brands',
  SPECIFIC_SELLERS = 'specific_sellers',
  FIRST_ORDER = 'first_order',
}

export enum CampaignType {
  SEASONAL = 'seasonal',
  FLASH_SALE = 'flash_sale',
  CLEARANCE = 'clearance',
  NEW_ARRIVAL = 'new_arrival',
  BUNDLE_DEAL = 'bundle_deal',
  SPECIAL_EVENT = 'special_event',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum FlashSaleStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum VoucherConditionType {
  MINIMUM_PURCHASE = 'minimum_purchase',
  MAXIMUM_DISCOUNT = 'maximum_discount',
  PRODUCT_QUANTITY = 'product_quantity',
  FIRST_TIME_BUYER = 'first_time_buyer',
  SPECIFIC_PAYMENT_METHOD = 'specific_payment_method',
}

export enum VoucherStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DEPLETED = 'depleted',
  CANCELLED = 'cancelled',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}
