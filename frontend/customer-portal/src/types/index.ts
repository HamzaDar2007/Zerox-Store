// ─── Common Types ───
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

// ─── Auth ───
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
  userRoles?: UserRole[]
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  role?: Role
  grantedBy?: string
  grantedAt: string
}

export interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

// ─── User Address ───
export interface UserAddress {
  id: string
  userId: string
  label?: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode?: string
  country: string
  isDefault: boolean
}

// ─── Categories & Brands ───
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  parent?: Category
  children?: Category[]
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

// ─── Sellers & Stores ───
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

// ─── Products ───
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
  shortDesc?: string
  fullDesc?: string
  basePrice: number
  currency: string
  isActive: boolean
  isDigital?: boolean
  requiresShipping?: boolean
  taxClass?: string
  status: string
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
  images?: ProductImage[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  price: number
  weightGrams?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  attributes?: VariantAttributeValue[]
}

export interface ProductImage {
  id: string
  productId: string
  variantId?: string
  url: string
  altText?: string
  sortOrder: number
  isPrimary?: boolean
  createdAt: string
  updatedAt: string
}

export interface AttributeKey {
  id: string
  name: string
  slug?: string
  inputType: string
  createdAt: string
}

export interface AttributeValue {
  id: string
  attributeKeyId: string
  value: string
  displayValue?: string
  sortOrder?: number
}

export interface VariantAttributeValue {
  variantId: string
  attributeKeyId: string
  attributeValueId: string
  attributeKey?: AttributeKey
  attributeValue?: AttributeValue
}

export interface ProductCategory {
  productId: string
  categoryId: string
  category?: Category
}

// ─── Cart ───
export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  currency: string
  couponId?: string
  coupon?: Coupon
  createdAt: string
  updatedAt: string
  items?: CartItem[]
}

export interface CartItem {
  id: string
  cartId: string
  variantId: string
  quantity: number
  unitPrice: number
  variant?: ProductVariant & { product?: Product }
  createdAt: string
  updatedAt: string
}

// ─── Wishlist ───
export interface Wishlist {
  id: string
  userId: string
  name: string
  isPublic: boolean
  items?: WishlistItem[]
}

export interface WishlistItem {
  id: string
  wishlistId: string
  variantId: string
  variant?: ProductVariant & { product?: Product }
}

// ─── Orders ───
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
  totalAmount: number
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
  store?: Store
  skuSnapshot: string
  nameSnapshot: string
  unitPrice: number
  quantity: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  flashSaleId?: string
  variant?: ProductVariant & { product?: Product }
}

export interface CreateOrderPayload {
  order: {
    couponId?: string
    shippingAmount?: number
    shippingLine1?: string
    shippingLine2?: string
    shippingCity?: string
    shippingState?: string
    shippingPostalCode?: string
    shippingCountry?: string
  }
  items: Array<{
    variantId: string
    quantity: number
    flashSaleId?: string
  }>
}

// ─── Payments ───
export interface Payment {
  id: string
  orderId: string
  order?: Order
  userId: string
  gateway: string
  gatewayTxId?: string
  method: string
  amount: number
  currency: string
  status: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ─── Coupons ───
export interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
  maxDiscount?: number
  minOrderValue?: number
  usageLimit?: number
  perUserLimit?: number
  isActive: boolean
  startsAt?: string
  expiresAt?: string
}

// ─── Flash Sales ───
export interface FlashSale {
  id: string
  name: string
  startsAt: string
  endsAt: string
  isActive: boolean
  items?: FlashSaleItem[]
}

export interface FlashSaleItem {
  id: string
  flashSaleId: string
  variantId: string
  salePrice: number
  quantityLimit?: number
  quantitySold?: number
  variant?: ProductVariant & { product?: Product }
}

// ─── Reviews ───
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
  sellerReply?: string
  sellerReplyAt?: string
  createdAt: string
  updatedAt: string
}

export interface RatingSummary {
  avg: number
  count: number
  average?: number
  total?: number
  distribution?: Record<number, number>
}

// ─── Notifications ───
export interface Notification {
  id: string
  userId: string
  channel: string
  type: string
  title?: string
  body?: string
  actionUrl?: string
  isRead: boolean
  readAt?: string
  sentAt?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ─── Returns ───
export interface Return {
  id: string
  orderId: string
  order?: Order
  userId: string
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
  orderItem?: OrderItem
  quantity: number
  condition?: string
  notes?: string
}

export interface CreateReturnPayload {
  return: {
    orderId: string
    reason: string
  }
  items: Array<{
    orderItemId: string
    quantity: number
    condition?: string
    notes?: string
  }>
}

// ─── Shipping ───
export interface ShippingMethod {
  id: string
  zoneId: string
  name: string
  carrier?: string
  estimatedDaysMin?: number
  estimatedDaysMax?: number
  baseRate: number
  perKgRate: number
  freeThreshold?: number
  isActive: boolean
  createdAt: string
}

export interface Shipment {
  id: string
  orderId: string
  order?: Order
  warehouseId: string
  shippingMethodId: string
  shippingMethod?: ShippingMethod
  trackingNumber?: string
  carrier?: string
  status: string
  dispatchedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface ShipmentEvent {
  id: string
  shipmentId: string
  status: string
  location?: string
  description?: string
  occurredAt: string
}

// ─── Chat ───
export interface ChatThread {
  id: string
  subject?: string
  orderId?: string
  productId?: string
  status: string
  createdAt: string
  updatedAt: string
  participants?: ChatThreadParticipant[]
}

export interface ChatThreadParticipant {
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
  createdAt: string
}

// ─── Search ───
export interface SearchQuery {
  id: string
  userId?: string
  query: string
  sessionId?: string
  resultCount?: number
  clickedProduct?: string
  searchedAt: string
}

export interface SearchProductsResponse {
  data: Product[]
  total: number
  query: string
}
