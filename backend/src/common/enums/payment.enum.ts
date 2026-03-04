export enum PaymentMethod {
  COD = 'cod',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  JAZZCASH = 'jazzcash',
  EASYPAISA = 'easypaisa',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
  LOYALTY_POINTS = 'loyalty_points',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  PAID = 'paid',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum RefundStatus {
  PENDING = 'pending',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
  MANUAL = 'manual',
}

export enum RefundReason {
  DEFECTIVE_PRODUCT = 'defective_product',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  CHANGED_MIND = 'changed_mind',
  DUPLICATE_ORDER = 'duplicate_order',
  SHIPPING_DAMAGE = 'shipping_damage',
  LATE_DELIVERY = 'late_delivery',
  ORDER_CANCELLED = 'order_cancelled',
  OTHER = 'other',
}

export enum PaymentAttemptStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
