// Common types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

// Auth
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  avatarUrl?: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
  role?: string
  roles?: UserRole[]
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  role?: Role
  grantedBy?: string
  grantedAt: string
}

export interface Address {
  id: string
  userId: string
  label?: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

// Roles & Permissions
export interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  code: string
  module: string
  description?: string
  createdAt: string
}

export interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  permission?: Permission
  grantedAt: string
}

// Categories & Brands
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  parent?: Category
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl?: string
  websiteUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Sellers & Stores
export interface Seller {
  id: string
  userId: string
  user?: User
  displayName: string
  legalName?: string
  taxId?: string
  commissionRate?: number
  status: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface Store {
  id: string
  sellerId: string
  seller?: Seller
  name: string
  slug: string
  description?: string
  logoUrl?: string
  bannerUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Products
export interface Product {
  id: string
  storeId: string
  store?: Store
  categoryId?: string
  category?: Category
  brandId?: string
  brand?: Brand
  name: string
  slug: string
  description?: string
  basePrice: number
  compareAtPrice?: number
  status: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
  images?: ProductImage[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name?: string
  price: number
  compareAtPrice?: number
  isActive: boolean
  createdAt: string
}

export interface ProductImage {
  id: string
  productId: string
  variantId?: string
  url: string
  altText?: string
  sortOrder: number
  createdAt: string
}

export interface AttributeKey {
  id: string
  name: string
  inputType: string
  createdAt: string
}

export interface AttributeValue {
  id: string
  attributeKeyId: string
  value: string
}

export interface VariantAttributeValue {
  id: string
  variantId: string
  attributeKeyId: string
  attributeValueId: string
  attributeKey?: AttributeKey
  attributeValue?: AttributeValue
}

export interface ProductCategory {
  id: string
  productId: string
  categoryId: string
  category?: Category
}

// Cart & Coupons
export interface Coupon {
  id: string
  code: string
  description?: string
  discountType: string
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  startsAt: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CouponScope {
  id: string
  couponId: string
  scopeType: string
  scopeId: string
  createdAt: string
}

export interface FlashSale {
  id: string
  name: string
  description?: string
  startsAt: string
  endsAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  items?: FlashSaleItem[]
}

export interface FlashSaleItem {
  id: string
  flashSaleId: string
  variantId: string
  salePrice: number
  qtyLimit?: number
  qtySold: number
}

// Orders
export interface Order {
  id: string
  userId: string
  user?: User
  couponId?: string
  status: string
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  total: number
  shippingLine1?: string
  shippingLine2?: string
  shippingCity?: string
  shippingState?: string
  shippingPostalCode?: string
  shippingCountry?: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  variantId: string
  storeId: string
  skuSnapshot: string
  nameSnapshot: string
  unitPrice: number
  quantity: number
  subtotal: number
  discountAmount: number
  total: number
}

// Payments
export interface Payment {
  id: string
  orderId: string
  userId: string
  gateway: string
  gatewayTxId?: string
  method?: string
  amount: number
  currency: string
  status: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Inventory
export interface Warehouse {
  id: string
  code: string
  name: string
  address?: string
  city?: string
  country?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  id: string
  warehouseId: string
  warehouse?: Warehouse
  variantId: string
  variant?: ProductVariant
  qtyOnHand: number
  qtyReserved: number
  qtyAvailable: number
  lowStockThreshold: number
}

// Shipping
export interface ShippingZone {
  id: string
  name: string
  isActive: boolean
  createdAt: string
}

export interface ShippingMethod {
  id: string
  zoneId: string
  name: string
  description?: string
  price: number
  minDeliveryDays?: number
  maxDeliveryDays?: number
  isActive: boolean
  createdAt: string
}

export interface ShippingZoneCountry {
  id: string
  zoneId: string
  countryCode: string
  createdAt: string
}

export interface Shipment {
  id: string
  orderId: string
  warehouseId?: string
  shippingMethodId?: string
  trackingNumber?: string
  carrier?: string
  status: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
}

export interface ShipmentEvent {
  id: string
  shipmentId: string
  status: string
  location?: string
  description?: string
  occurredAt: string
}

// Subscriptions
export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  interval: string
  intervalCount: number
  trialDays: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  user?: User
  planId: string
  plan?: SubscriptionPlan
  status: string
  gateway?: string
  gatewaySubId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

// Returns
export interface Return {
  id: string
  orderId: string
  userId: string
  user?: User
  order?: Order
  reason: string
  status: string
  refundAmount?: number
  reviewedBy?: string
  createdAt: string
  updatedAt: string
  items?: ReturnItem[]
}

export interface ReturnItem {
  id: string
  returnId: string
  orderItemId: string
  quantity: number
  condition?: string
  notes?: string
}

// Reviews
export interface Review {
  id: string
  productId: string
  product?: Product
  userId: string
  user?: User
  orderId?: string
  rating: number
  title?: string
  body?: string
  isVerified: boolean
  status: string
  createdAt: string
  updatedAt: string
}

// Notifications
export interface Notification {
  id: string
  userId: string
  channel: string
  type: string
  title: string
  body: string
  actionUrl?: string
  isRead: boolean
  readAt?: string
  sentAt: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// Chat
export interface ChatThread {
  id: string
  orderId?: string
  productId?: string
  status: string
  createdAt: string
  updatedAt: string
  participants?: ChatThreadParticipant[]
}

export interface ChatThreadParticipant {
  id: string
  threadId: string
  userId: string
  user?: User
  joinedAt: string
  lastReadAt?: string
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  sender?: User
  body: string
  attachmentUrl?: string
  sentAt: string
  deletedAt?: string
}

// Audit
export interface AuditLog {
  id: string
  actorId?: string
  actor?: User
  action: string
  tableName: string
  recordId?: string
  diff?: Record<string, unknown>
  ip?: string
  userAgent?: string
  occurredAt: string
  createdAt: string
}

// Search
export interface SearchQuery {
  id: string
  userId?: string
  sessionId?: string
  query: string
  resultCount: number
  clickedProductId?: string
  searchedAt: string
}
