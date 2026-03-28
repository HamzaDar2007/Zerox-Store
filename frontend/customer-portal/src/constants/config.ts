export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ShopVerse'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PRODUCTS_PER_PAGE: 24,
  ORDERS_PER_PAGE: 10,
  REVIEWS_PER_PAGE: 10,
} as const

export const SEARCH_DEBOUNCE_MS = 300

export const DEFAULT_PAGE_SIZE = 24

export const HERO_AUTOPLAY_INTERVAL = 5000

export const MAX_CART_QUANTITY = 10

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export const RETURN_STATUSES = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RECEIVED: 'received',
  REFUNDED: 'refunded',
} as const

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'stripe', label: 'Credit / Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'Easypaisa' },
] as const

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'name_asc', label: 'Name: A to Z' },
] as const

export const CURRENCY = 'Rs.'
