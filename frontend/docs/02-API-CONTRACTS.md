# 02 — API Contracts

> **Contract Type:** Backend API Surface — Types, Enums, DTOs, Endpoints
> **Dependencies:** `01-SETUP-AND-CONFIG.md` (project must exist)
> **Generates:** `src/types/*.types.ts`, `src/types/enums.ts`
> **IMPORTANT:** This is the single source of truth for all TypeScript types in the frontend.

---

## Response Envelope

Every backend response is wrapped in a standard envelope. Generate `src/types/api.types.ts`:

```typescript
// src/types/api.types.ts

/** Successful API response */
export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

/** Error API response */
export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: string[];
}

/** Paginated response shape (inside data) */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Standard pagination query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/** API response wrapping paginated data */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
```

---

## Enums

Generate `src/types/enums.ts` — ALL enums matching backend exactly:

```typescript
// src/types/enums.ts

// ─── User ────────────────────────────────────────────
export type UserRole = 'customer' | 'seller' | 'admin' | 'super_admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type LoginStatus = 'success' | 'failed' | 'blocked';

// ─── Product ─────────────────────────────────────────
export type ProductStatus = 'draft' | 'pending_review' | 'active' | 'published' | 'inactive' | 'out_of_stock' | 'discontinued' | 'rejected';
export type AttributeType = 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'color' | 'date';
export type WarrantyType = 'brand' | 'seller' | 'marketplace' | 'none';

// ─── Order ───────────────────────────────────────────
export type OrderStatus = 'pending_payment' | 'pending' | 'confirmed' | 'processing' | 'partially_shipped' | 'shipped' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled' | 'partially_cancelled' | 'refunded' | 'partially_refunded';
export type OrderItemStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded' | 'exchanged';

// ─── Payment ─────────────────────────────────────────
export type PaymentMethod = 'cod' | 'credit_card' | 'debit_card' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'wallet' | 'loyalty_points';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'paid' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
export type RefundStatus = 'pending' | 'requested' | 'approved' | 'rejected' | 'processing' | 'processed' | 'completed' | 'failed';
export type RefundMethod = 'original_payment' | 'wallet' | 'bank_transfer' | 'manual';
export type RefundReason = 'defective_product' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'duplicate_order' | 'shipping_damage' | 'late_delivery' | 'order_cancelled' | 'other';
export type PaymentAttemptStatus = 'initiated' | 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

// ─── Seller ──────────────────────────────────────────
export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
export type SellerDocType = 'business_license' | 'tax_certificate' | 'id_card' | 'cnic' | 'bank_statement' | 'address_proof';
export type DocStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type ViolationSeverity = 'warning' | 'minor' | 'major' | 'critical';
export type ViolationPenalty = 'warning' | 'listing_suspended' | 'account_suspended' | 'fine' | 'permanent_ban';
export type PayoutFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

// ─── Checkout ────────────────────────────────────────
export type CheckoutStep = 'cart_review' | 'address' | 'shipping' | 'payment' | 'review' | 'completed' | 'abandoned';

// ─── Review ──────────────────────────────────────────
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ReviewReportReason = 'spam' | 'inappropriate' | 'fake_review' | 'offensive' | 'irrelevant' | 'other';
export type ReviewReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

// ─── Inventory ───────────────────────────────────────
export type StockMovementType = 'purchase' | 'sale' | 'return' | 'adjustment_add' | 'adjustment_subtract' | 'transfer_in' | 'transfer_out' | 'reservation' | 'reservation_release' | 'damage' | 'expired';
export type ReservationStatus = 'held' | 'committed' | 'released' | 'expired';
export type TransferStatus = 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';

// ─── Shipping ────────────────────────────────────────
export type ShipmentStatus = 'pending' | 'label_created' | 'picked_up' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned_to_sender' | 'shipped';
export type ShippingMethodType = 'standard' | 'express' | 'same_day' | 'next_day' | 'economy' | 'pickup' | 'freight';
export type ShippingRateType = 'flat' | 'weight_based' | 'price_based' | 'item_based' | 'free';

// ─── Dispute ─────────────────────────────────────────
export type DisputeType = 'item_not_received' | 'item_not_as_described' | 'counterfeit' | 'seller_not_responding' | 'wrong_item' | 'damaged_item' | 'missing_parts' | 'other';
export type DisputeStatus = 'open' | 'under_review' | 'escalated' | 'awaiting_seller' | 'awaiting_buyer' | 'resolved' | 'closed';
export type DisputeResolution = 'refund_buyer' | 'side_with_seller' | 'partial_refund' | 'replacement' | 'mutual_agreement' | 'no_action';
export type DisputePriority = 'low' | 'medium' | 'high' | 'urgent';
export type DisputeEvidenceType = 'image' | 'video' | 'document' | 'receipt' | 'tracking_info' | 'communication' | 'other';

// ─── Return ──────────────────────────────────────────
export type ReturnType = 'return' | 'exchange';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'item_shipped' | 'item_received' | 'inspecting' | 'refund_processed' | 'exchanged' | 'closed' | 'pending' | 'completed';
export type ReturnShipmentStatus = 'pending_pickup' | 'picked_up' | 'in_transit' | 'received' | 'inspecting' | 'completed' | 'pending';
export type ReturnResolution = 'refund' | 'exchange' | 'repair' | 'store_credit';
export type ReturnShipmentDirection = 'customer_to_warehouse' | 'warehouse_to_customer';

// ─── Wallet ──────────────────────────────────────────
export type WalletTransactionType = 'credit' | 'debit' | 'withdrawal' | 'refund_credit' | 'commission_deduction' | 'payout' | 'adjustment' | 'bonus';
export type WalletTransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

// ─── Notification ────────────────────────────────────
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationType = 'order_status' | 'payment_status' | 'shipping_update' | 'promotion' | 'review_request' | 'price_drop' | 'back_in_stock' | 'security_alert' | 'system' | 'chat_message' | 'support_ticket';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// ─── Ticket ──────────────────────────────────────────
export type TicketStatus = 'open' | 'in_progress' | 'awaiting_customer' | 'awaiting_agent' | 'escalated' | 'resolved' | 'closed' | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// ─── Loyalty ─────────────────────────────────────────
export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus' | 'referral_bonus' | 'refund_reversal';
export type ReferralStatus = 'pending' | 'qualified' | 'rewarded' | 'expired';
export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';

// ─── Marketing ───────────────────────────────────────
export type VoucherType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
export type VoucherScope = 'all' | 'specific_products' | 'specific_categories' | 'specific_brands' | 'specific_sellers' | 'first_order';
export type VoucherStatus = 'draft' | 'active' | 'expired' | 'depleted' | 'cancelled';
export type CampaignType = 'seasonal' | 'flash_sale' | 'clearance' | 'new_arrival' | 'bundle_deal' | 'special_event';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
export type FlashSaleStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';
export type DiscountType = 'percentage' | 'fixed_amount';
export type VoucherConditionType = 'minimum_purchase' | 'maximum_discount' | 'product_quantity' | 'first_time_buyer' | 'specific_payment_method';

// ─── Chat ────────────────────────────────────────────
export type MessageType = 'text' | 'image' | 'product_link' | 'order_link' | 'file' | 'system';
export type MessageSenderType = 'customer' | 'seller' | 'support' | 'system';
export type ConversationType = 'customer_seller' | 'customer_support' | 'seller_support';
export type ConversationStatus = 'open' | 'active' | 'archived' | 'blocked' | 'closed';

// ─── CMS ─────────────────────────────────────────────
export type BannerPosition = 'homepage_hero' | 'homepage_mid' | 'homepage_bottom' | 'category_top' | 'category_sidebar' | 'product_sidebar' | 'checkout_banner' | 'app_splash' | 'app_popup';
export type BannerLinkType = 'product' | 'category' | 'brand' | 'campaign' | 'store' | 'page' | 'external';
export type RedirectType = '301' | '302' | '307';
export type TextDirection = 'ltr' | 'rtl';

// ─── Operations ──────────────────────────────────────
export type ImportJobType = 'product_import' | 'product_export' | 'order_export' | 'inventory_import' | 'inventory_export' | 'customer_export' | 'review_export';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type BulkOperationType = 'price_update' | 'stock_update' | 'status_update' | 'category_update' | 'delete' | 'activate' | 'deactivate';

// ─── Audit ───────────────────────────────────────────
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject' | 'suspend' | 'restore' | 'password_change' | 'settings_change';

// ─── Recommendations ─────────────────────────────────
export type RecommendationType = 'frequently_bought_together' | 'similar_products' | 'also_viewed' | 'trending_in_category' | 'personalized';

// ─── Permissions ─────────────────────────────────────
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'publish' | 'archive' | 'restore' | 'bulk_create' | 'bulk_update' | 'bulk_delete' | 'import' | 'export' | 'assign' | 'unassign' | 'manage' | 'view_all' | 'view_own' | 'view_team' | 'report' | 'analyze' | 'configure' | 'backup' | 'restore_backup' | 'convert' | 'merge' | 'respond' | 'resolve' | 'close' | 'escalate' | 'monitor' | 'audit';
```

---

## Entity Type Definitions

### Auth & Users — `src/types/auth.types.ts`

```typescript
import type { UserRole, Gender, LoginStatus } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  isActive: boolean;
  profileImage: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  referralCode: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
  twoFactorEnabled: boolean;
  preferredLanguageId: string | null;
  preferredCurrencyId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // NOTE: password, twoFactorSecret, twoFactorBackupCodes are select:false
  // but the backend HAS A BUG that may leak password. Always use sanitizeUser().
}

/** Safe user subset for display — use this in UI components */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  profileImage: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  area: string | null;
  streetAddress: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryInstructions: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  loginAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceFingerprint: string | null;
  status: LoginStatus;
  failureReason: string | null;
  locationCountry: string | null;
  locationCity: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

### Products — `src/types/product.types.ts`

```typescript
import type { ProductStatus, AttributeType, WarrantyType } from './enums';

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  brandId: string | null;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  currencyCode: string;
  stock: number;
  lowStockThreshold: number;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  weightUnit: string;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: string;
  warrantyType: WarrantyType | null;
  warrantyDurationMonths: number | null;
  tags: string[] | null;
  status: ProductStatus;
  isFeatured: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  isTaxable: boolean;
  avgRating: number;
  totalReviews: number;
  totalSales: number;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  options: Record<string, string> | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attributeId: string;
  attributeOptionId: string | null;
  valueText: string | null;
  valueNumeric: number | null;
  createdAt: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  questionText: string;
  isApproved: boolean;
  isFeatured: boolean;
  answerCount: number;
  answers?: ProductAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductAnswer {
  id: string;
  questionId: string;
  userId: string | null;
  sellerId: string | null;
  answerText: string;
  isSellerAnswer: boolean;
  isApproved: boolean;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  variantId: string | null;
  oldPrice: number;
  newPrice: number;
  changedBy: string | null;
  changeReason: string | null;
  createdAt: string;
}
```

### Categories — `src/types/category.types.ts`

```typescript
import type { AttributeType } from './enums';

export interface Category {
  id: string;
  parentId: string | null;
  parent?: Category;
  children?: Category[];
  name: string;
  slug: string;
  imageUrl: string | null;
  iconUrl: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  commissionRate: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  depth: number;
  path: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  websiteUrl: string | null;
  countryOfOrigin: string | null;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  attributeGroupId: string | null;
  name: string;
  slug: string;
  type: AttributeType;
  unit: string | null;
  isFilterable: boolean;
  isRequired: boolean;
  isVariantAttribute: boolean;
  options?: AttributeOption[];
  createdAt: string;
}

export interface AttributeGroup {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  attributes?: Attribute[];
  createdAt: string;
}

export interface AttributeOption {
  id: string;
  attributeId: string;
  value: string;
  colorHex: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
}
```

### Orders — `src/types/order.types.ts`

```typescript
import type { OrderStatus, OrderItemStatus, ShipmentStatus } from './enums';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  voucherId: string | null;
  voucherCode: string | null;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown> | null;
  shippingMethod: string | null;
  paymentMethod: string | null;
  customerNotes: string | null;
  sellerNotes: string | null;
  internalNotes: string | null;
  isGift: boolean;
  giftMessage: string | null;
  giftWrapRequested: boolean;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  sourcePlatform: string;
  deviceType: string | null;
  ipAddress: string | null;
  placedAt: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  shipments?: Shipment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productSnapshot: Record<string, unknown>;
  quantity: number;
  unitPrice: number;
  originalPrice: number | null;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderItemStatus;
  isGift: boolean;
  fulfilledQuantity: number;
  returnedQuantity: number;
  refundedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  shipmentNumber: string;
  carrierId: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ShipmentStatus;
  shippingCost: number;
  weightKg: number | null;
  dimensions: Record<string, unknown> | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryAt: string | null;
  deliveryAddress: Record<string, unknown>;
  deliveryInstructions: string | null;
  metadata: Record<string, unknown> | null;
  items?: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  orderItemId: string;
  quantity: number;
  createdAt: string;
}
```

### Cart — `src/types/cart.types.ts`

```typescript
import type { CheckoutStep } from './enums';

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  currencyCode: string;
  voucherId: string | null;
  discountAmount: number;
  lastActivityAt: string | null;
  abandonedEmailSent: boolean;
  items?: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  priceAtAddition: number;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSession {
  id: string;
  userId: string | null;
  cartId: string;
  sessionToken: string;
  step: CheckoutStep;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  shippingMethodId: string | null;
  paymentMethod: string | null;
  cartSnapshot: Record<string, unknown> | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  giftWrapRequested: boolean;
  giftMessage: string | null;
  deviceType: string | null;
  ipAddress: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Sellers — `src/types/seller.types.ts`

```typescript
import type { VerificationStatus, PayoutFrequency, SellerDocType, DocStatus, ViolationSeverity, ViolationPenalty, WalletTransactionType } from './enums';

export interface Seller {
  id: string;
  userId: string;
  businessName: string;
  businessNameAr: string | null;
  cnic: string | null;
  cnicFrontImage: string | null;
  cnicBackImage: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountTitle: string | null;
  bankIban: string | null;
  bankSwift: string | null;
  payoutFrequency: PayoutFrequency;
  commissionRate: number;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  suspensionReason: string | null;
  suspendedAt: string | null;
  vacationMode: boolean;
  vacationStartDate: string | null;
  vacationEndDate: string | null;
  avgResponseTime: string | null;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  stores?: Store[];
  wallet?: SellerWallet;
  documents?: SellerDocument[];
  violations?: SellerViolation[];
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
  rating: number;
  totalReviews: number;
  totalSales: number;
  totalFollowers: number;
  isActive: boolean;
  isFeatured: boolean;
  followers?: StoreFollower[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreFollower {
  id: string;
  storeId: string;
  userId: string;
  followedAt: string;
}

export interface SellerWallet {
  id: string;
  sellerId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currencyCode: string;
  transactions?: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  orderId: string | null;
  type: WalletTransactionType;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  balanceAfter: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface SellerDocument {
  id: string;
  sellerId: string;
  documentType: SellerDocType;
  fileUrl: string;
  status: DocStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerViolation {
  id: string;
  sellerId: string;
  violationType: string;
  severity: ViolationSeverity;
  description: string | null;
  evidenceUrls: string[] | null;
  penaltyAction: ViolationPenalty | null;
  fineAmount: number | null;
  issuedBy: string;
  appealedAt: string | null;
  appealNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}
```

### Payments — `src/types/payment.types.ts`

```typescript
import type { PaymentMethod, PaymentStatus, RefundStatus, RefundReason, PaymentAttemptStatus } from './enums';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  paymentNumber: string;
  amount: number;
  currencyCode: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gatewayName: string | null;
  gatewayTransactionId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  refundedAmount: number;
  metadata: Record<string, unknown> | null;
  attempts?: PaymentAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAttempt {
  id: string;
  paymentId: string;
  attemptNumber: number;
  status: PaymentAttemptStatus;
  gatewayName: string | null;
  gatewayRequest: Record<string, unknown> | null;
  gatewayResponse: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  refundNumber: string;
  amount: number;
  reason: RefundReason | null;
  reasonDetails: string | null;
  status: RefundStatus;
  gatewayRefundId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  processedBy: string | null;
  processedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  paymentMethod: string | null;
  nickname: string | null;
  isDefault: boolean;
  gatewayToken: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
  cardExpiryMonth: number | null;
  cardExpiryYear: number | null;
  bankName: string | null;
  accountLastFour: string | null;
  walletProvider: string | null;
  walletId: string | null;
  metadata: Record<string, unknown> | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Reviews — `src/types/review.types.ts`

```typescript
import type { ReviewStatus, ReviewReportReason, ReviewReportStatus } from './enums';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  pros: string[];
  cons: string[];
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  notHelpfulCount: number;
  sellerResponse: string | null;
  sellerResponseAt: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  moderationNotes: string | null;
  helpfulness?: ReviewHelpfulness[];
  reports?: ReviewReport[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewHelpfulness {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reportedBy: string;
  reason: ReviewReportReason;
  details: string | null;
  status: ReviewReportStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Inventory — `src/types/inventory.types.ts`

```typescript
import type { StockMovementType, ReservationStatus, TransferStatus } from './enums';

export interface Inventory {
  id: string;
  productId: string;
  productVariantId: string | null;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lowStockThreshold: number;
  reorderPoint: number | null;
  reorderQuantity: number | null;
  lastRestockedAt: string | null;
  movements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  sellerId: string | null;
  name: string;
  code: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  inventory?: Inventory[];
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  inventoryId: string;
  type: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  costPerUnit: number | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface StockReservation {
  id: string;
  inventoryId: string;
  productId: string;
  orderId: string | null;
  cartId: string | null;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: TransferStatus;
  note: string | null;
  initiatedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  cancelledAt: string | null;
  items?: InventoryTransferItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransferItem {
  id: string;
  transferId: string;
  productId: string;
  productVariantId: string | null;
  quantityRequested: number;
  quantityShipped: number | null;
  quantityReceived: number | null;
}
```

### Roles & Permissions — `src/types/role.types.ts`

```typescript
import type { PermissionAction } from './enums';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  permissions?: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  module: string;
  action: PermissionAction;
  description: string | null;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission?: Permission;
  createdAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string | null;
  assignedAt: string;
}
```

### Shipping — `src/types/shipping.types.ts`

```typescript
import type { ShippingMethodType, ShippingRateType } from './enums';

export interface ShippingZone {
  id: string;
  name: string;
  description: string | null;
  countries: string[];
  states: string[];
  postcodes: string[];
  isDefault: boolean;
  rates?: ShippingRate[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  type: ShippingMethodType;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
  rates?: ShippingRate[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  logo: string | null;
  trackingUrlTemplate: string | null;
  isActive: boolean;
  settings: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  id: string;
  shippingMethodId: string;
  shippingZoneId: string;
  rateType: ShippingRateType;
  baseRate: number;
  perKgRate: number | null;
  perItemRate: number | null;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  freeShippingThreshold: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  maxOrders: number;
  additionalFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Tax — `src/types/tax.types.ts`

```typescript
export interface TaxZone {
  id: string;
  name: string;
  description: string | null;
  countries: string[];
  states: string[];
  postcodes: string[];
  isDefault: boolean;
  rates?: TaxRate[];
  createdAt: string;
  updatedAt: string;
}

export interface TaxRate {
  id: string;
  taxZoneId: string;
  taxClassId: string | null;
  name: string;
  rate: number;
  priority: number;
  isCompound: boolean;
  includesShipping: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxClass {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### i18n — `src/types/i18n.types.ts`

```typescript
import type { TextDirection } from './enums';

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  direction: TextDirection;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Translation {
  id: string;
  languageId: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  translatedValue: string;
  isAutoTranslated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolPosition: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  rateHistory?: CurrencyRateHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyRateHistory {
  id: string;
  currencyId: string;
  rate: number;
  source: string | null;
  recordedAt: string;
}
```

### Search — `src/types/search.types.ts`

```typescript
import type { RecommendationType } from './enums';

export interface SearchHistory {
  id: string;
  userId: string | null;
  sessionId: string | null;
  searchQuery: string;
  resultsCount: number;
  filters: Record<string, unknown> | null;
  clickedProductId: string | null;
  createdAt: string;
}

export interface RecentlyViewed {
  id: string;
  userId: string | null;
  sessionId: string | null;
  productId: string;
  viewCount: number;
  lastViewedAt: string;
  createdAt: string;
}

export interface ProductComparison {
  id: string;
  userId: string | null;
  sessionId: string | null;
  productIds: string[];
  comparisonKey: string;
  createdAt: string;
}

export interface ProductRecommendation {
  id: string;
  sourceProductId: string;
  recommendedProductId: string;
  type: RecommendationType;
  score: number;
  isManual: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Tickets — `src/types/ticket.types.ts`

```typescript
import type { TicketStatus, TicketPriority } from './enums';

export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  categoryId: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  orderId: string | null;
  attachments: Record<string, unknown>[] | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  satisfactionRating: number | null;
  satisfactionFeedback: string | null;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  isStaff: boolean;
  message: string;
  attachments: Record<string, unknown>[] | null;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  parent?: TicketCategory;
  children?: TicketCategory[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### Disputes — `src/types/dispute.types.ts`

```typescript
import type { DisputeType, DisputeStatus, DisputeResolution, DisputePriority, DisputeEvidenceType } from './enums';

export interface Dispute {
  id: string;
  disputeNumber: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  type: DisputeType;
  status: DisputeStatus;
  subject: string;
  description: string;
  disputedAmount: number;
  resolution: DisputeResolution | null;
  resolutionNotes: string | null;
  refundAmount: number | null;
  assignedTo: string | null;
  escalatedAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  messages?: DisputeMessage[];
  evidence?: DisputeEvidence[];
  createdAt: string;
  updatedAt: string;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submittedBy: string;
  type: string;
  fileUrl: string;
  description: string | null;
  createdAt: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  message: string;
  isInternal: boolean;
  attachments: Record<string, unknown>[] | null;
  readAt: string | null;
  createdAt: string;
}
```

### Returns — `src/types/return.types.ts`

```typescript
import type { ReturnType, ReturnStatus, ReturnResolution, ReturnShipmentStatus, ReturnShipmentDirection } from './enums';

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  reasonId: string | null;
  reasonDetails: string | null;
  type: ReturnType;
  status: ReturnStatus;
  quantity: number;
  refundAmount: number | null;
  resolution: ReturnResolution | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
  customerNotes: string | null;
  receivedAt: string | null;
  completedAt: string | null;
  images?: ReturnImage[];
  shipments?: ReturnShipment[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnReason {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  requiresImages: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnImage {
  id: string;
  returnRequestId: string;
  imageUrl: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ReturnShipment {
  id: string;
  returnRequestId: string;
  direction: ReturnShipmentDirection;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ReturnShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Subscriptions — `src/types/subscription.types.ts`

```typescript
import type { SubscriptionFrequency, SubscriptionStatus } from './enums';

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  frequency: SubscriptionFrequency;
  deliveryAddressId: string | null;
  paymentMethodId: string | null;
  unitPrice: number;
  discountPercentage: number;
  nextDeliveryDate: string | null;
  lastOrderDate: string | null;
  status: SubscriptionStatus;
  pausedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  totalOrders: number;
  totalSpent: number;
  subscriptionOrders?: SubscriptionOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionOrder {
  id: string;
  subscriptionId: string;
  orderId: string | null;
  scheduledDate: string;
  actualDate: string | null;
  status: string;
  failureReason: string | null;
  retryCount: number;
  createdAt: string;
}
```

### SEO — `src/types/seo.types.ts`

```typescript
import type { RedirectType } from './enums';

export interface SeoMetadata {
  id: string;
  entityType: string;
  entityId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[] | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  structuredData: Record<string, unknown> | null;
  noIndex: boolean;
  noFollow: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UrlRedirect {
  id: string;
  sourcePath: string;
  targetPath: string;
  redirectType: RedirectType;
  isActive: boolean;
  hitCount: number;
  lastHitAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Bundles — `src/types/bundle.types.ts`

```typescript
export interface ProductBundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  imageUrl: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  items?: BundleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BundleItem {
  id: string;
  bundleId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  sortOrder: number;
  createdAt: string;
}
```

---

## DTO Interfaces (Request Bodies)

### Auth DTOs

```typescript
// POST /auth/register
export interface RegisterDto {
  name: string;              // required, max 100
  email: string;             // required, valid email, max 150
  password: string;          // required, min 8, max 128, must have upper+lower+digit
  phone?: string;            // optional, max 20
}

// POST /auth/login
export interface LoginDto {
  email: string;             // required, valid email, max 255
  password: string;          // required, min 1, max 255
}

// POST /auth/refresh
export interface RefreshTokenDto {
  refreshToken: string;      // required
}

// POST /auth/password-forgot
export interface ForgotPasswordDto {
  email: string;             // required, valid email, max 255
}

// POST /auth/password-reset
export interface ResetPasswordDto {
  token: string;             // required
  password: string;          // required, min 8, max 128, upper+lower+digit
}
```

### User DTOs

```typescript
// POST /users
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  dateOfBirth?: string;      // ISO date
  gender?: Gender;
}

// PATCH /users/:id
export type UpdateUserDto = Partial<CreateUserDto>;

// POST /users/:userId/addresses
export interface CreateAddressDto {
  label?: string;            // max 50
  fullName: string;          // max 100
  phone: string;             // max 20
  country: string;           // max 100
  province: string;          // max 100
  city: string;              // max 100
  area?: string;             // max 100
  streetAddress: string;
  postalCode?: string;       // max 20
  latitude?: number;         // -90 to 90
  longitude?: number;        // -180 to 180
  deliveryInstructions?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

// PATCH /users/:userId/addresses/:id
export type UpdateAddressDto = Partial<CreateAddressDto>;
```

### Product DTOs

```typescript
// POST /products
export interface CreateProductDto {
  sellerId: string;
  categoryId: string;
  brandId?: string;
  name: string;              // max 300
  slug?: string;
  description?: string;
  shortDescription?: string; // max 500
  price: number;             // min 0
  compareAtPrice?: number;
  costPrice?: number;
  currencyCode?: string;     // default 'PKR'
  stock?: number;            // default 0
  lowStockThreshold?: number;// default 5
  sku?: string;              // max 100
  barcode?: string;          // max 50
  weight?: number;
  weightUnit?: string;       // default 'kg'
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;    // default 'cm'
  warrantyType?: WarrantyType;
  warrantyDurationMonths?: number; // 0-120
  tags?: string[];
  status?: ProductStatus;    // default 'draft'
  isFeatured?: boolean;
  isDigital?: boolean;
  requiresShipping?: boolean;
  isTaxable?: boolean;
  metaTitle?: string;        // max 255
  metaDescription?: string;  // max 500
}

// PATCH /products/:id — all fields optional except sellerId excluded
export type UpdateProductDto = Partial<Omit<CreateProductDto, 'sellerId'>>;

// POST /products/:id/variants
export interface CreateProductVariantDto {
  productId: string;
  name?: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  options?: Record<string, string>;
  imageUrl?: string;
  isActive?: boolean;
}

// POST /products/:id/images
export interface CreateProductImageDto {
  productId: string;
  variantId?: string;
  url: string;               // max 500
  altText?: string;           // max 200
  isPrimary?: boolean;
  sortOrder?: number;
}
```

### Order DTOs

```typescript
// POST /orders
export interface CreateOrderDto {
  userId: string;
  storeId: string;
  status?: OrderStatus;
  currencyCode?: string;
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  totalAmount: number;
  voucherId?: string;
  voucherCode?: string;
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown>;
  shippingMethod?: string;
  paymentMethod?: string;
  customerNotes?: string;
  isGift?: boolean;
  giftMessage?: string;      // max 500
  giftWrapRequested?: boolean;
  loyaltyPointsUsed?: number;
  estimatedDeliveryDate?: string;
  sourcePlatform?: string;
  deviceType?: string;
  ipAddress?: string;
}

// PATCH /orders/:id
export type UpdateOrderDto = Partial<CreateOrderDto>;

// POST /orders/:id/items
export interface CreateOrderItemDto {
  orderId: string;
  productId: string;
  variantId?: string;
  productSnapshot: Record<string, unknown>;
  quantity: number;           // min 1
  unitPrice: number;
  originalPrice?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  status?: OrderItemStatus;
  isGift?: boolean;
}

// POST /orders/:orderId/shipments
export interface CreateShipmentDto {
  orderId: string;
  shipmentNumber: string;
  carrierId?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status?: ShipmentStatus;
  shippingCost?: number;
  weightKg?: number;
  dimensions?: Record<string, unknown>;
  estimatedDeliveryAt?: string;
  deliveryAddress: Record<string, unknown>;
  deliveryInstructions?: string;
  metadata?: Record<string, unknown>;
}
```

### Cart DTOs

```typescript
// POST /cart
export interface CreateCartDto {
  userId?: string;
  sessionId?: string;
  currencyCode?: string;
  voucherId?: string;
  discountAmount?: number;
}

// POST /cart/:cartId/items
export interface CreateCartItemDto {
  cartId?: string;
  productId: string;
  variantId?: string;
  quantity?: number;          // default 1
  priceAtAddition?: number;
}

// PATCH /cart/items/:id
export interface UpdateCartItemDto {
  quantity?: number;          // min 1
}

// POST /cart/wishlist
export interface CreateWishlistDto {
  userId?: string;
  productId: string;
  notifyOnSale?: boolean;
  notifyOnRestock?: boolean;
}

// POST /cart/checkout-sessions
export interface CreateCheckoutSessionDto {
  userId?: string;
  cartId: string;
  sessionToken: string;
  step?: CheckoutStep;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingMethodId?: string;
  paymentMethod?: string;
  cartSnapshot?: Record<string, unknown>;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  totalAmount?: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscount?: number;
  giftWrapRequested?: boolean;
  giftMessage?: string;
  deviceType?: string;
  ipAddress?: string;
  expiresAt?: string;
}

// PATCH /cart/checkout-sessions/:id
export type UpdateCheckoutSessionDto = Partial<CreateCheckoutSessionDto>;
```

### Category DTOs

```typescript
// POST /categories
export interface CreateCategoryDto {
  name: string;              // max 100
  slug?: string;
  parentId?: string;
  imageUrl?: string;
  iconUrl?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  commissionRate?: number;   // 0-100
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

// PATCH /categories/:id
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// POST /categories/brands
export interface CreateBrandDto {
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  countryOfOrigin?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// PATCH /categories/brands/:id
export type UpdateBrandDto = Partial<CreateBrandDto>;

// POST /categories/attributes
export interface CreateAttributeDto {
  name: string;
  slug?: string;
  attributeGroupId?: string;
  type?: AttributeType;
  unit?: string;
  isFilterable?: boolean;
  isRequired?: boolean;
  isVariantAttribute?: boolean;
}
```

### Shipping DTOs

```typescript
// POST /shipping/zones
export interface CreateShippingZoneDto {
  name: string;
  description?: string;
  countries?: string[];
  states?: string[];
  postcodes?: string[];
  isDefault?: boolean;
}

export type UpdateShippingZoneDto = Partial<CreateShippingZoneDto>;

// POST /shipping/methods
export interface CreateShippingMethodDto {
  name: string;
  code: string;
  type?: ShippingMethodType;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
}

export type UpdateShippingMethodDto = Partial<CreateShippingMethodDto>;

// POST /shipping/carriers
export interface CreateShippingCarrierDto {
  name: string;
  code: string;
  logo?: string;
  trackingUrlTemplate?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export type UpdateShippingCarrierDto = Partial<CreateShippingCarrierDto>;

// POST /shipping/rates
export interface CreateShippingRateDto {
  shippingMethodId: string;
  shippingZoneId: string;
  rateType?: ShippingRateType;
  baseRate: number;
  perKgRate?: number;
  perItemRate?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  freeShippingThreshold?: number;
}

export type UpdateShippingRateDto = Partial<CreateShippingRateDto>;

// POST /shipping/slots
export interface CreateDeliverySlotDto {
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek?: number[];
  maxOrders?: number;
  additionalFee?: number;
  isActive?: boolean;
}

// POST /shipping/calculate
export interface CalculateShippingDto {
  zoneId: string;
  weight: number;
  totalAmount: number;
}
```

### Tax DTOs

```typescript
// POST /tax/zones
export interface CreateTaxZoneDto {
  name: string;
  description?: string;
  countries?: string[];
  states?: string[];
  postcodes?: string[];
  isDefault?: boolean;
}

export type UpdateTaxZoneDto = Partial<CreateTaxZoneDto>;

// POST /tax/rates
export interface CreateTaxRateDto {
  taxZoneId: string;
  taxClassId?: string;
  name: string;
  rate: number;
  priority?: number;
  isCompound?: boolean;
  includesShipping?: boolean;
  isActive?: boolean;
}

export type UpdateTaxRateDto = Partial<CreateTaxRateDto>;

// POST /tax/classes
export interface CreateTaxClassDto {
  name: string;
  description?: string;
  isDefault?: boolean;
}

export type UpdateTaxClassDto = Partial<CreateTaxClassDto>;

// POST /tax/calculate
export interface CalculateTaxDto {
  amount: number;
  countryCode: string;
  stateCode?: string;
  taxClassId?: string;
}
```

### i18n DTOs

```typescript
// POST /i18n/languages
export interface CreateLanguageDto {
  code: string;
  name: string;
  nativeName: string;
  direction?: TextDirection;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateLanguageDto = Partial<CreateLanguageDto>;

// POST /i18n/translations/upsert
export interface UpsertTranslationDto {
  languageId: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  translatedValue: string;
  isAutoTranslated?: boolean;
}

// POST /i18n/currencies
export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  symbolPosition?: string;
  decimalPlaces?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  exchangeRate?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export type UpdateCurrencyDto = Partial<CreateCurrencyDto>;
```

### Ticket DTOs

```typescript
// POST /tickets
export interface CreateTicketDto {
  subject: string;
  description: string;
  categoryId?: string;
  priority?: TicketPriority;
  orderId?: string;
  attachments?: Record<string, unknown>[];
}

export type UpdateTicketDto = Partial<CreateTicketDto>;

// POST /tickets/:id/messages
export interface CreateTicketMessageDto {
  message: string;           // NOTE: backend field is `message`, NOT `content`
  attachments?: Record<string, unknown>[];
  isInternal?: boolean;
}

// POST /tickets/categories
export interface CreateTicketCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}
```

### Dispute DTOs

```typescript
// POST /disputes
export interface CreateDisputeDto {
  orderId: string;
  type: DisputeType;
  subject: string;
  description: string;
  disputedAmount?: number;
}

// POST /disputes/:id/evidence
export interface CreateDisputeEvidenceDto {
  type: string;
  fileUrl: string;
  description?: string;
}

// PATCH /disputes/:id/status
export interface UpdateDisputeStatusDto {
  status: DisputeStatus;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  refundAmount?: number;
}

// POST /disputes/:id/messages
export interface CreateDisputeMessageDto {
  message: string;
  isInternal?: boolean;
  attachments?: Record<string, unknown>[];
}
```

### Return DTOs

```typescript
// POST /returns
export interface CreateReturnDto {
  orderId: string;
  orderItemId: string;
  reasonId?: string;
  reasonDetails?: string;
  type?: ReturnType;
  quantity: number;
  customerNotes?: string;
}

// PATCH /returns/:id/status
export interface UpdateReturnStatusDto {
  status: ReturnStatus;
  notes?: string;
}

// POST /returns/:id/images
export interface CreateReturnImageDto {
  imageUrl: string;
  description?: string;
  sortOrder?: number;
}

// POST /return-reasons
export interface CreateReturnReasonDto {
  name: string;
  description?: string;
  isActive?: boolean;
  requiresImages?: boolean;
  sortOrder?: number;
}

export type UpdateReturnReasonDto = Partial<CreateReturnReasonDto>;
```

### Subscription DTOs

```typescript
// POST /subscriptions
export interface CreateSubscriptionDto {
  productId: string;
  variantId?: string;
  quantity?: number;
  frequency: SubscriptionFrequency;
  deliveryAddressId?: string;
  paymentMethodId?: string;
}

export type UpdateSubscriptionDto = Partial<Omit<CreateSubscriptionDto, 'productId'>>;

// POST /subscriptions/:id/cancel
export interface CancelSubscriptionDto {
  reason?: string;
}
```

### SEO DTOs

```typescript
// POST /seo/metadata
export interface CreateSeoMetadataDto {
  entityType: string;
  entityId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
  noFollow?: boolean;
}

export type UpdateSeoMetadataDto = Partial<CreateSeoMetadataDto>;

// POST /seo/redirects
export interface CreateUrlRedirectDto {
  sourcePath: string;
  targetPath: string;
  redirectType?: RedirectType;
  isActive?: boolean;
}

export type UpdateUrlRedirectDto = Partial<CreateUrlRedirectDto>;
```

### Bundle DTOs

```typescript
// POST /bundles
export interface CreateBundleDto {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  imageUrl?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export type UpdateBundleDto = Partial<CreateBundleDto>;

// POST /bundles/:id/items
export interface CreateBundleItemDto {
  productId: string;
  variantId?: string;
  quantity?: number;
  sortOrder?: number;
}
```

---

## Complete Endpoint Catalog

> Every endpoint known to the backend, grouped by module.
> Auth column: `Public` = no auth, `JWT` = any authenticated user, `Role:X` = requires role, `Perm:X` = requires permission.
> ⚠️ = Known backend issue (may 500 or return unexpected data).

### Auth Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| POST | `/auth/register` | Public | `RegisterDto` | `ApiResponse<LoginResponse>` | Returns tokens + user |
| POST | `/auth/login` | Public | `LoginDto` | `ApiResponse<LoginResponse>` | Returns tokens + user |
| POST | `/auth/refresh` | Public | `RefreshTokenDto` | `ApiResponse<{accessToken, refreshToken}>` | |
| POST | `/auth/logout` | JWT | `{refreshToken}` | `ApiResponse<null>` | |
| GET | `/auth/profile` | JWT | — | `ApiResponse<User>` | ⚠️ May leak password hash |
| POST | `/auth/password-forgot` | Public | `ForgotPasswordDto` | `ApiResponse<{token}>` | ⚠️ Returns token directly (should be email-only) |
| POST | `/auth/password-reset` | Public | `ResetPasswordDto` | `ApiResponse<null>` | |
| POST | `/auth/change-password` | JWT | `{oldPassword, newPassword}` | `ApiResponse<null>` | |

### Users Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/users` | Role:admin | — | `PaginatedResponse<User>` | `?page&limit&search&role` |
| GET | `/users/:id` | Role:admin | — | `ApiResponse<User>` | ⚠️ May leak password |
| POST | `/users` | Role:admin | `CreateUserDto` | `ApiResponse<User>` | |
| PATCH | `/users/:id` | Role:admin | `UpdateUserDto` | `ApiResponse<User>` | |
| DELETE | `/users/:id` | Role:admin | — | `ApiResponse<null>` | Soft delete |
| GET | `/users/:id/addresses` | JWT | — | `ApiResponse<Address[]>` | |
| POST | `/users/:id/addresses` | JWT | `CreateAddressDto` | `ApiResponse<Address>` | |
| PATCH | `/users/:userId/addresses/:id` | JWT | `UpdateAddressDto` | `ApiResponse<Address>` | |
| DELETE | `/users/:userId/addresses/:id` | JWT | — | `ApiResponse<null>` | |
| GET | `/users/:id/login-history` | JWT | — | `PaginatedResponse<LoginHistory>` | |

### Products Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/products` | Public | — | `PaginatedResponse<Product>` | `?page&limit&search&categoryId&brandId&status&minPrice&maxPrice&sortBy&sortOrder` |
| GET | `/products/:id` | Public | — | `ApiResponse<Product>` | Includes variants, images, attributes |
| POST | `/products` | Role:seller | `CreateProductDto` | `ApiResponse<Product>` | |
| PATCH | `/products/:id` | Role:seller | `UpdateProductDto` | `ApiResponse<Product>` | |
| DELETE | `/products/:id` | Role:seller | — | `ApiResponse<null>` | Soft delete |
| GET | `/products/slug/:slug` | Public | — | `ApiResponse<Product>` | |
| GET | `/products/:id/variants` | Public | — | `ApiResponse<ProductVariant[]>` | |
| POST | `/products/:id/variants` | Role:seller | `CreateProductVariantDto` | `ApiResponse<ProductVariant>` | |
| PATCH | `/products/variants/:id` | Role:seller | `UpdateProductVariantDto` | `ApiResponse<ProductVariant>` | |
| DELETE | `/products/variants/:id` | Role:seller | — | `ApiResponse<null>` | |
| GET | `/products/:id/images` | Public | — | `ApiResponse<ProductImage[]>` | |
| POST | `/products/:id/images` | Role:seller | `CreateProductImageDto` | `ApiResponse<ProductImage>` | |
| DELETE | `/products/images/:id` | Role:seller | — | `ApiResponse<null>` | |
| GET | `/products/:id/questions` | Public | — | `PaginatedResponse<ProductQuestion>` | |
| POST | `/products/:id/questions` | JWT | `{questionText}` | `ApiResponse<ProductQuestion>` | |
| POST | `/products/questions/:id/answers` | JWT | `{answerText}` | `ApiResponse<ProductAnswer>` | |
| GET | `/products/:id/price-history` | Role:admin | — | `ApiResponse<PriceHistory[]>` | |

### Categories Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/categories` | Public | — | `ApiResponse<Category[]>` | Returns tree structure |
| GET | `/categories/:id` | Public | — | `ApiResponse<Category>` | |
| POST | `/categories` | Role:admin | `CreateCategoryDto` | `ApiResponse<Category>` | |
| PATCH | `/categories/:id` | Role:admin | `UpdateCategoryDto` | `ApiResponse<Category>` | |
| DELETE | `/categories/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/categories/brands` | Public | — | `PaginatedResponse<Brand>` | |
| GET | `/categories/brands/:id` | Public | — | `ApiResponse<Brand>` | |
| POST | `/categories/brands` | Role:admin | `CreateBrandDto` | `ApiResponse<Brand>` | |
| PATCH | `/categories/brands/:id` | Role:admin | `UpdateBrandDto` | `ApiResponse<Brand>` | |
| DELETE | `/categories/brands/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/categories/attributes` | Public | — | `ApiResponse<Attribute[]>` | |
| POST | `/categories/attributes` | Role:admin | `CreateAttributeDto` | `ApiResponse<Attribute>` | |
| PATCH | `/categories/attributes/:id` | Role:admin | — | `ApiResponse<Attribute>` | |
| DELETE | `/categories/attributes/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/categories/attribute-groups` | Public | — | `ApiResponse<AttributeGroup[]>` | |
| POST | `/categories/attribute-groups` | Role:admin | `{name, slug?}` | `ApiResponse<AttributeGroup>` | |

### Orders Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/orders` | JWT | — | `PaginatedResponse<Order>` | ⚠️ May 500 (broken relations) |
| GET | `/orders/:id` | JWT | — | `ApiResponse<Order>` | ⚠️ May 500 |
| POST | `/orders` | JWT | `CreateOrderDto` | `ApiResponse<Order>` | |
| PATCH | `/orders/:id` | JWT | `UpdateOrderDto` | `ApiResponse<Order>` | |
| DELETE | `/orders/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/orders/:id/items` | JWT | — | `ApiResponse<OrderItem[]>` | |
| POST | `/orders/:id/items` | JWT | `CreateOrderItemDto` | `ApiResponse<OrderItem>` | |
| PATCH | `/orders/items/:id` | JWT | `UpdateOrderItemDto` | `ApiResponse<OrderItem>` | |
| GET | `/orders/:id/status-history` | JWT | — | `ApiResponse<OrderStatusHistory[]>` | |
| GET | `/orders/:id/shipments` | JWT | — | `ApiResponse<Shipment[]>` | |
| POST | `/orders/:id/shipments` | Role:seller | `CreateShipmentDto` | `ApiResponse<Shipment>` | |
| PATCH | `/orders/shipments/:id` | Role:seller | `UpdateShipmentDto` | `ApiResponse<Shipment>` | |

### Cart Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/cart` | JWT | — | `ApiResponse<Cart>` | Get user's active cart |
| POST | `/cart` | JWT | `CreateCartDto` | `ApiResponse<Cart>` | |
| PATCH | `/cart/:id` | JWT | `UpdateCartDto` | `ApiResponse<Cart>` | |
| DELETE | `/cart/:id` | JWT | — | `ApiResponse<null>` | |
| GET | `/cart/:id/items` | JWT | — | `ApiResponse<CartItem[]>` | |
| POST | `/cart/:id/items` | JWT | `CreateCartItemDto` | `ApiResponse<CartItem>` | |
| PATCH | `/cart/items/:id` | JWT | `UpdateCartItemDto` | `ApiResponse<CartItem>` | |
| DELETE | `/cart/items/:id` | JWT | — | `ApiResponse<null>` | |
| GET | `/cart/wishlist` | JWT | — | `PaginatedResponse<Wishlist>` | |
| POST | `/cart/wishlist` | JWT | `CreateWishlistDto` | `ApiResponse<Wishlist>` | |
| DELETE | `/cart/wishlist/:id` | JWT | — | `ApiResponse<null>` | |
| POST | `/cart/checkout-sessions` | JWT | `CreateCheckoutSessionDto` | `ApiResponse<CheckoutSession>` | ⚠️ May 500 |
| PATCH | `/cart/checkout-sessions/:id` | JWT | `UpdateCheckoutSessionDto` | `ApiResponse<CheckoutSession>` | |

### Sellers Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/sellers` | Role:admin | — | `PaginatedResponse<Seller>` | |
| GET | `/sellers/:id` | JWT | — | `ApiResponse<Seller>` | |
| POST | `/sellers` | JWT | `CreateSellerDto` | `ApiResponse<Seller>` | |
| PATCH | `/sellers/:id` | JWT | `UpdateSellerDto` | `ApiResponse<Seller>` | |
| DELETE | `/sellers/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/sellers/:id/stores` | Public | — | `ApiResponse<Store[]>` | |
| POST | `/sellers/:id/stores` | Role:seller | `CreateStoreDto` | `ApiResponse<Store>` | |
| PATCH | `/sellers/stores/:id` | Role:seller | `UpdateStoreDto` | `ApiResponse<Store>` | |
| GET | `/sellers/:id/wallet` | Role:seller | — | `ApiResponse<SellerWallet>` | |
| GET | `/sellers/:id/wallet/transactions` | Role:seller | — | `PaginatedResponse<WalletTransaction>` | |
| GET | `/sellers/:id/documents` | JWT | — | `ApiResponse<SellerDocument[]>` | |
| POST | `/sellers/:id/documents` | Role:seller | `CreateSellerDocumentDto` | `ApiResponse<SellerDocument>` | |
| GET | `/sellers/:id/violations` | JWT | — | `ApiResponse<SellerViolation[]>` | |
| POST | `/sellers/stores/:id/follow` | JWT | — | `ApiResponse<StoreFollower>` | |
| DELETE | `/sellers/stores/:id/unfollow` | JWT | — | `ApiResponse<null>` | |

### Payments Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/payments` | Role:admin | — | `PaginatedResponse<Payment>` | |
| GET | `/payments/:id` | JWT | — | `ApiResponse<Payment>` | ⚠️ May 500 |
| POST | `/payments` | JWT | `CreatePaymentDto` | `ApiResponse<Payment>` | ⚠️ May 500 |
| PATCH | `/payments/:id` | Role:admin | `UpdatePaymentDto` | `ApiResponse<Payment>` | |
| GET | `/payments/:id/refunds` | JWT | — | `ApiResponse<Refund[]>` | |
| POST | `/payments/:id/refunds` | Role:admin | `CreateRefundDto` | `ApiResponse<Refund>` | |
| GET | `/payments/saved-methods` | JWT | — | `ApiResponse<SavedPaymentMethod[]>` | |
| POST | `/payments/saved-methods` | JWT | — | `ApiResponse<SavedPaymentMethod>` | |
| DELETE | `/payments/saved-methods/:id` | JWT | — | `ApiResponse<null>` | |

### Reviews Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/reviews` | Public | — | `PaginatedResponse<Review>` | `?productId&status` |
| GET | `/reviews/:id` | Public | — | `ApiResponse<Review>` | |
| POST | `/reviews` | JWT | `CreateReviewDto` | `ApiResponse<Review>` | |
| PATCH | `/reviews/:id` | JWT | `UpdateReviewDto` | `ApiResponse<Review>` | |
| DELETE | `/reviews/:id` | JWT | — | `ApiResponse<null>` | |
| POST | `/reviews/:id/helpfulness` | JWT | `{isHelpful}` | `ApiResponse<ReviewHelpfulness>` | |
| POST | `/reviews/:id/report` | JWT | `{reason, details?}` | `ApiResponse<ReviewReport>` | |
| PATCH | `/reviews/:id/moderate` | Role:admin | `{status, notes?}` | `ApiResponse<Review>` | |
| POST | `/reviews/:id/seller-response` | Role:seller | `{response}` | `ApiResponse<Review>` | |

### Inventory Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/inventory` | Role:seller | — | `PaginatedResponse<Inventory>` | |
| GET | `/inventory/:id` | Role:seller | — | `ApiResponse<Inventory>` | |
| POST | `/inventory` | Role:seller | `CreateInventoryDto` | `ApiResponse<Inventory>` | |
| PATCH | `/inventory/:id` | Role:seller | `UpdateInventoryDto` | `ApiResponse<Inventory>` | |
| GET | `/inventory/warehouses` | Role:seller | — | `ApiResponse<Warehouse[]>` | |
| POST | `/inventory/warehouses` | Role:admin | `CreateWarehouseDto` | `ApiResponse<Warehouse>` | |
| PATCH | `/inventory/warehouses/:id` | Role:admin | `UpdateWarehouseDto` | `ApiResponse<Warehouse>` | |
| GET | `/inventory/:id/movements` | Role:seller | — | `PaginatedResponse<StockMovement>` | |
| POST | `/inventory/:id/movements` | Role:seller | `CreateStockMovementDto` | `ApiResponse<StockMovement>` | |
| GET | `/inventory/reservations` | Role:seller | — | `ApiResponse<StockReservation[]>` | |
| GET | `/inventory/transfers` | Role:seller | — | `PaginatedResponse<InventoryTransfer>` | |
| POST | `/inventory/transfers` | Role:seller | `CreateTransferDto` | `ApiResponse<InventoryTransfer>` | |
| PATCH | `/inventory/transfers/:id` | Role:admin | `UpdateTransferDto` | `ApiResponse<InventoryTransfer>` | |

### Shipping Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/shipping/zones` | Perm:shipping.read | — | `ApiResponse<ShippingZone[]>` | |
| GET | `/shipping/zones/:id` | Perm:shipping.read | — | `ApiResponse<ShippingZone>` | |
| POST | `/shipping/zones` | Perm:shipping.create | `CreateShippingZoneDto` | `ApiResponse<ShippingZone>` | |
| PATCH | `/shipping/zones/:id` | Perm:shipping.update | `UpdateShippingZoneDto` | `ApiResponse<ShippingZone>` | |
| DELETE | `/shipping/zones/:id` | Perm:shipping.delete | — | `ApiResponse<null>` | |
| GET | `/shipping/methods` | Perm:shipping.read | — | `ApiResponse<ShippingMethod[]>` | `?isActive` |
| POST | `/shipping/methods` | Perm:shipping.create | `CreateShippingMethodDto` | `ApiResponse<ShippingMethod>` | |
| PATCH | `/shipping/methods/:id` | Perm:shipping.update | `UpdateShippingMethodDto` | `ApiResponse<ShippingMethod>` | |
| DELETE | `/shipping/methods/:id` | Perm:shipping.delete | — | `ApiResponse<null>` | |
| GET | `/shipping/rates` | Public | — | `ApiResponse<ShippingRate[]>` | |
| POST | `/shipping/rates` | Perm:shipping.create | `CreateShippingRateDto` | `ApiResponse<ShippingRate>` | |
| PATCH | `/shipping/rates/:id` | Perm:shipping.update | `UpdateShippingRateDto` | `ApiResponse<ShippingRate>` | |
| GET | `/shipping/carriers` | Perm:shipping.read | — | `ApiResponse<ShippingCarrier[]>` | |
| POST | `/shipping/carriers` | Perm:shipping.create | `CreateShippingCarrierDto` | `ApiResponse<ShippingCarrier>` | |
| PATCH | `/shipping/carriers/:id` | Perm:shipping.update | `UpdateShippingCarrierDto` | `ApiResponse<ShippingCarrier>` | |
| POST | `/shipping/calculate` | Public | `CalculateShippingDto` | `ApiResponse<{rate, estimatedDays}>` | |
| GET | `/shipping/slots` | Public | — | `ApiResponse<DeliverySlot[]>` | |
| POST | `/shipping/slots` | Perm:shipping.create | `CreateDeliverySlotDto` | `ApiResponse<DeliverySlot>` | |

### Tax Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/tax/zones` | Perm:tax.read | — | `ApiResponse<TaxZone[]>` | |
| GET | `/tax/zones/:id` | Perm:tax.read | — | `ApiResponse<TaxZone>` | |
| POST | `/tax/zones` | Perm:tax.create | `CreateTaxZoneDto` | `ApiResponse<TaxZone>` | |
| PATCH | `/tax/zones/:id` | Perm:tax.update | `UpdateTaxZoneDto` | `ApiResponse<TaxZone>` | |
| DELETE | `/tax/zones/:id` | Perm:tax.delete | — | `ApiResponse<null>` | |
| GET | `/tax/rates` | Perm:tax.read | — | `ApiResponse<TaxRate[]>` | |
| POST | `/tax/rates` | Perm:tax.create | `CreateTaxRateDto` | `ApiResponse<TaxRate>` | |
| PATCH | `/tax/rates/:id` | Perm:tax.update | `UpdateTaxRateDto` | `ApiResponse<TaxRate>` | |
| DELETE | `/tax/rates/:id` | Perm:tax.delete | — | `ApiResponse<null>` | |
| GET | `/tax/classes` | Perm:tax.read | — | `ApiResponse<TaxClass[]>` | |
| POST | `/tax/classes` | Perm:tax.create | `CreateTaxClassDto` | `ApiResponse<TaxClass>` | |
| PATCH | `/tax/classes/:id` | Perm:tax.update | `UpdateTaxClassDto` | `ApiResponse<TaxClass>` | |
| POST | `/tax/calculate` | Public | `CalculateTaxDto` | `ApiResponse<{taxAmount, breakdown[]}>` | Body: `{amount, countryCode, stateCode?, taxClassId?}` |

### Marketing Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/marketing/vouchers` | Role:admin | — | `PaginatedResponse<Voucher>` | |
| GET | `/marketing/vouchers/:id` | Role:admin | — | `ApiResponse<Voucher>` | |
| POST | `/marketing/vouchers` | Role:admin | — | `ApiResponse<Voucher>` | |
| PATCH | `/marketing/vouchers/:id` | Role:admin | — | `ApiResponse<Voucher>` | |
| DELETE | `/marketing/vouchers/:id` | Role:admin | — | `ApiResponse<null>` | |
| POST | `/marketing/vouchers/validate` | JWT | `{code, cartTotal}` | `ApiResponse<VoucherValidation>` | |
| GET | `/marketing/campaigns` | Role:admin | — | `PaginatedResponse<Campaign>` | |
| POST | `/marketing/campaigns` | Role:admin | — | `ApiResponse<Campaign>` | |
| PATCH | `/marketing/campaigns/:id` | Role:admin | — | `ApiResponse<Campaign>` | |
| GET | `/marketing/flash-sales` | Public | — | `ApiResponse<FlashSale[]>` | |
| POST | `/marketing/flash-sales` | Role:admin | — | `ApiResponse<FlashSale>` | |

### CMS Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/cms/pages` | Public | — | `PaginatedResponse<CmsPage>` | |
| GET | `/cms/pages/:id` | Public | — | `ApiResponse<CmsPage>` | |
| POST | `/cms/pages` | Role:admin | — | `ApiResponse<CmsPage>` | |
| PATCH | `/cms/pages/:id` | Role:admin | — | `ApiResponse<CmsPage>` | |
| DELETE | `/cms/pages/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/cms/banners` | Public | — | `ApiResponse<Banner[]>` | `?position` |
| POST | `/cms/banners` | Role:admin | — | `ApiResponse<Banner>` | |
| PATCH | `/cms/banners/:id` | Role:admin | — | `ApiResponse<Banner>` | |
| DELETE | `/cms/banners/:id` | Role:admin | — | `ApiResponse<null>` | |

### SEO Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/seo/metadata` | Role:admin | — | `PaginatedResponse<SeoMetadata>` | |
| GET | `/seo/metadata/:id` | Role:admin | — | `ApiResponse<SeoMetadata>` | |
| GET | `/seo/metadata/entity/:type/:id` | Role:admin | — | `ApiResponse<SeoMetadata>` | Get by entity |
| POST | `/seo/metadata` | Role:admin | `CreateSeoMetadataDto` | `ApiResponse<SeoMetadata>` | |
| POST | `/seo/metadata/upsert/:type/:id` | Role:admin | `CreateSeoMetadataDto` | `ApiResponse<SeoMetadata>` | Upsert by entity |
| PATCH | `/seo/metadata/:id` | Role:admin | `UpdateSeoMetadataDto` | `ApiResponse<SeoMetadata>` | |
| DELETE | `/seo/metadata/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/seo/redirects` | Role:admin | — | `PaginatedResponse<UrlRedirect>` | |
| GET | `/seo/redirects/:id` | Role:admin | — | `ApiResponse<UrlRedirect>` | |
| POST | `/seo/redirects` | Role:admin | `CreateUrlRedirectDto` | `ApiResponse<UrlRedirect>` | |
| POST | `/seo/redirects/bulk` | Role:admin | `CreateUrlRedirectDto[]` | `ApiResponse<UrlRedirect[]>` | |
| PATCH | `/seo/redirects/:id` | Role:admin | `UpdateUrlRedirectDto` | `ApiResponse<UrlRedirect>` | |
| PATCH | `/seo/redirects/:id/toggle-active` | Role:admin | — | `ApiResponse<UrlRedirect>` | |
| DELETE | `/seo/redirects/:id` | Role:admin | — | `ApiResponse<null>` | |

### Chat Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/chat/conversations` | JWT | — | `PaginatedResponse<Conversation>` | |
| GET | `/chat/conversations/:id` | JWT | — | `ApiResponse<Conversation>` | |
| POST | `/chat/conversations` | JWT | — | `ApiResponse<Conversation>` | |
| GET | `/chat/conversations/:id/messages` | JWT | — | `PaginatedResponse<Message>` | Poll every 5s |
| POST | `/chat/conversations/:id/messages` | JWT | `{content, type?}` | `ApiResponse<Message>` | |
| PATCH | `/chat/conversations/:id` | JWT | — | `ApiResponse<Conversation>` | Close/archive |

### Tickets Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/tickets` | JWT | — | `PaginatedResponse<Ticket>` | `?userId&status&priority&page&limit` |
| GET | `/tickets/my-tickets` | JWT | — | `PaginatedResponse<Ticket>` | `?page&limit` |
| GET | `/tickets/:id` | JWT | — | `ApiResponse<Ticket>` | |
| POST | `/tickets` | JWT | `CreateTicketDto` | `ApiResponse<Ticket>` | |
| PATCH | `/tickets/:id` | JWT | `UpdateTicketDto` | `ApiResponse<Ticket>` | |
| PATCH | `/tickets/:id/status` | Perm:tickets.update | `{status}` | `ApiResponse<Ticket>` | |
| PATCH | `/tickets/:id/assign` | Perm:tickets.update | `{assignedTo}` | `ApiResponse<Ticket>` | |
| GET | `/tickets/:id/messages` | JWT | — | `ApiResponse<TicketMessage[]>` | |
| POST | `/tickets/:id/messages` | JWT | `CreateTicketMessageDto` | `ApiResponse<TicketMessage>` | ⚠️ Field is `message`, NOT `content` |
| GET | `/tickets/categories/all` | Public | — | `ApiResponse<TicketCategory[]>` | |
| POST | `/tickets/categories` | Perm:tickets.create | `CreateTicketCategoryDto` | `ApiResponse<TicketCategory>` | |

### Disputes Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/disputes` | JWT | — | `PaginatedResponse<Dispute>` | `?userId&status&orderId&page&limit` |
| GET | `/disputes/:id` | JWT | — | `ApiResponse<Dispute>` | Includes evidence + messages |
| POST | `/disputes` | JWT | `CreateDisputeDto` | `ApiResponse<Dispute>` | |
| POST | `/disputes/:id/evidence` | JWT | `CreateDisputeEvidenceDto` | `ApiResponse<DisputeEvidence>` | |
| PATCH | `/disputes/:id/status` | Perm:disputes.update | `UpdateDisputeStatusDto` | `ApiResponse<Dispute>` | Use for resolve/escalate |
| GET | `/disputes/:id/messages` | JWT | — | `ApiResponse<DisputeMessage[]>` | |
| POST | `/disputes/:id/messages` | JWT | `CreateDisputeMessageDto` | `ApiResponse<DisputeMessage>` | |

### Returns Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/returns` | JWT | — | `PaginatedResponse<ReturnRequest>` | `?userId&orderId&status&page&limit` |
| GET | `/returns/:id` | JWT | — | `ApiResponse<ReturnRequest>` | Includes images + shipments |
| POST | `/returns` | JWT | `CreateReturnDto` | `ApiResponse<ReturnRequest>` | |
| PATCH | `/returns/:id` | JWT | — | `ApiResponse<ReturnRequest>` | |
| PATCH | `/returns/:id/status` | Perm:returns.update | `UpdateReturnStatusDto` | `ApiResponse<ReturnRequest>` | |
| POST | `/returns/:id/images` | JWT | `CreateReturnImageDto` | `ApiResponse<ReturnImage>` | |
| GET | `/return-reasons` | Public | — | `ApiResponse<ReturnReason[]>` | |
| POST | `/return-reasons` | Perm:returns.create | `CreateReturnReasonDto` | `ApiResponse<ReturnReason>` | |
| PATCH | `/return-reasons/:id` | Perm:returns.update | `UpdateReturnReasonDto` | `ApiResponse<ReturnReason>` | |

### Notifications Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/notifications` | JWT | — | `PaginatedResponse<Notification>` | |
| GET | `/notifications/:id` | JWT | — | `ApiResponse<Notification>` | |
| POST | `/notifications` | Role:admin | — | `ApiResponse<Notification>` | |
| PATCH | `/notifications/:id/read` | JWT | — | `ApiResponse<Notification>` | Mark as read |
| POST | `/notifications/mark-all-read` | JWT | — | `ApiResponse<null>` | |
| GET | `/notifications/templates` | Role:admin | — | `ApiResponse<NotificationTemplate[]>` | |
| POST | `/notifications/templates` | Role:admin | — | `ApiResponse<NotificationTemplate>` | |

### Loyalty Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/loyalty/points` | JWT | — | `ApiResponse<{balance, transactions}>` | |
| GET | `/loyalty/transactions` | JWT | — | `PaginatedResponse<LoyaltyTransaction>` | |
| POST | `/loyalty/redeem` | JWT | `{points}` | `ApiResponse<LoyaltyTransaction>` | |
| GET | `/loyalty/referrals` | JWT | — | `ApiResponse<Referral[]>` | |
| POST | `/loyalty/referrals` | JWT | `{code}` | `ApiResponse<Referral>` | |
| GET | `/loyalty/config` | Role:admin | — | `ApiResponse<LoyaltyConfig>` | |
| PATCH | `/loyalty/config` | Role:admin | — | `ApiResponse<LoyaltyConfig>` | |

### Subscriptions Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/subscriptions` | Perm:subscriptions.read | — | `PaginatedResponse<Subscription>` | Admin: all subscriptions |
| GET | `/subscriptions/my-subscriptions` | JWT | — | `ApiResponse<Subscription[]>` | Current user's subscriptions |
| GET | `/subscriptions/due` | Perm:subscriptions.read | — | `ApiResponse<Subscription[]>` | Due for renewal |
| GET | `/subscriptions/:id` | JWT | — | `ApiResponse<Subscription>` | |
| POST | `/subscriptions` | JWT | `CreateSubscriptionDto` | `ApiResponse<Subscription>` | |
| PATCH | `/subscriptions/:id` | JWT | `UpdateSubscriptionDto` | `ApiResponse<Subscription>` | |
| POST | `/subscriptions/:id/cancel` | JWT | `CancelSubscriptionDto` | `ApiResponse<Subscription>` | |
| POST | `/subscriptions/:id/pause` | JWT | — | `ApiResponse<Subscription>` | |
| POST | `/subscriptions/:id/resume` | JWT | — | `ApiResponse<Subscription>` | |
| POST | `/subscriptions/:id/renew` | Perm:subscriptions.update | — | `ApiResponse<Subscription>` | Process renewal |
| GET | `/subscriptions/:id/orders` | JWT | — | `ApiResponse<SubscriptionOrder[]>` | |

### Bundles Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/bundles` | Public | — | `PaginatedResponse<ProductBundle>` | |
| GET | `/bundles/active` | Public | — | `ApiResponse<ProductBundle[]>` | Only active bundles |
| GET | `/bundles/slug/:slug` | Public | — | `ApiResponse<ProductBundle>` | |
| GET | `/bundles/:id` | Public | — | `ApiResponse<ProductBundle>` | Includes items |
| GET | `/bundles/:id/price` | Public | — | `ApiResponse<{totalPrice, bundlePrice, savings}>` | |
| POST | `/bundles` | Role:admin | `CreateBundleDto` | `ApiResponse<ProductBundle>` | |
| PATCH | `/bundles/:id` | Role:admin | `UpdateBundleDto` | `ApiResponse<ProductBundle>` | |
| PATCH | `/bundles/:id/toggle-active` | Role:admin | — | `ApiResponse<ProductBundle>` | |
| DELETE | `/bundles/:id` | Role:admin | — | `ApiResponse<null>` | |
| GET | `/bundles/:id/items` | Public | — | `ApiResponse<BundleItem[]>` | |
| POST | `/bundles/:id/items` | Role:admin | `CreateBundleItemDto` | `ApiResponse<BundleItem>` | |
| PATCH | `/bundles/:id/items/:itemId` | Role:admin | `Partial<CreateBundleItemDto>` | `ApiResponse<BundleItem>` | |
| DELETE | `/bundles/:id/items/:itemId` | Role:admin | — | `ApiResponse<null>` | |

### i18n Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/i18n/languages` | Public | — | `ApiResponse<Language[]>` | |
| GET | `/i18n/languages/active` | Public | — | `ApiResponse<Language[]>` | Only active |
| GET | `/i18n/languages/code/:code` | Public | — | `ApiResponse<Language>` | |
| GET | `/i18n/languages/:id` | Public | — | `ApiResponse<Language>` | |
| POST | `/i18n/languages` | Perm:i18n.create | `CreateLanguageDto` | `ApiResponse<Language>` | |
| PATCH | `/i18n/languages/:id` | Perm:i18n.update | `UpdateLanguageDto` | `ApiResponse<Language>` | |
| DELETE | `/i18n/languages/:id` | Perm:i18n.delete | — | `ApiResponse<null>` | |
| POST | `/i18n/languages/:id/set-default` | Perm:i18n.update | — | `ApiResponse<Language>` | |
| GET | `/i18n/translations` | Public | — | `ApiResponse<Translation[]>` | `?languageId&entityType` |
| POST | `/i18n/translations` | Perm:i18n.create | `UpsertTranslationDto` | `ApiResponse<Translation>` | |
| POST | `/i18n/translations/upsert` | Perm:i18n.update | `UpsertTranslationDto` | `ApiResponse<Translation>` | |
| PATCH | `/i18n/translations/:id` | Perm:i18n.update | `Partial<UpsertTranslationDto>` | `ApiResponse<Translation>` | |
| DELETE | `/i18n/translations/:id` | Perm:i18n.delete | — | `ApiResponse<null>` | |
| GET | `/i18n/currencies` | Public | — | `ApiResponse<Currency[]>` | `?isActive` |
| GET | `/i18n/currencies/active` | Public | — | `ApiResponse<Currency[]>` | |
| GET | `/i18n/currencies/code/:code` | Public | — | `ApiResponse<Currency>` | |
| GET | `/i18n/currencies/convert` | Public | — | `ApiResponse<{amount, from, to, result}>` | `?amount&from&to` |
| GET | `/i18n/currencies/:id` | Public | — | `ApiResponse<Currency>` | |
| GET | `/i18n/currencies/:id/rate-history` | Perm:i18n.read | — | `ApiResponse<CurrencyRateHistory[]>` | |
| POST | `/i18n/currencies` | Perm:i18n.create | `CreateCurrencyDto` | `ApiResponse<Currency>` | |
| PATCH | `/i18n/currencies/:id` | Perm:i18n.update | `UpdateCurrencyDto` | `ApiResponse<Currency>` | |
| DELETE | `/i18n/currencies/:id` | Perm:i18n.delete | — | `ApiResponse<null>` | |
| POST | `/i18n/currencies/:id/set-default` | Perm:i18n.update | — | `ApiResponse<Currency>` | |

### Operations Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/operations/jobs` | Role:admin | — | `PaginatedResponse<ImportJob>` | |
| POST | `/operations/import` | Role:admin | — | `ApiResponse<ImportJob>` | |
| POST | `/operations/export` | Role:admin | — | `ApiResponse<ImportJob>` | |
| GET | `/operations/bulk` | Role:admin | — | `PaginatedResponse<BulkOperation>` | |
| POST | `/operations/bulk` | Role:admin | — | `ApiResponse<BulkOperation>` | |

### System Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/system/settings` | Role:super_admin | — | `ApiResponse<SystemSetting[]>` | |
| PATCH | `/system/settings` | Role:super_admin | — | `ApiResponse<SystemSetting>` | |
| GET | `/system/features` | Role:super_admin | — | `ApiResponse<FeatureFlag[]>` | |
| PATCH | `/system/features/:id` | Role:super_admin | — | `ApiResponse<FeatureFlag>` | |
| GET | `/system/health` | Public | — | `{status: 'ok'}` | |

### Audit Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/audit` | Role:admin | — | `PaginatedResponse<AuditLog>` | `?userId&action&module&from&to` |
| GET | `/audit/:id` | Role:admin | — | `ApiResponse<AuditLog>` | |

### Roles Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/roles` | Role:super_admin | — | `ApiResponse<Role[]>` | |
| GET | `/roles/:id` | Role:super_admin | — | `ApiResponse<Role>` | |
| POST | `/roles` | Role:super_admin | — | `ApiResponse<Role>` | |
| PATCH | `/roles/:id` | Role:super_admin | — | `ApiResponse<Role>` | |
| DELETE | `/roles/:id` | Role:super_admin | — | `ApiResponse<null>` | |

### Permissions Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| GET | `/permissions` | Role:super_admin | — | `ApiResponse<Permission[]>` | |
| POST | `/permissions` | Role:super_admin | — | `ApiResponse<Permission>` | |
| GET | `/role-permissions/:roleId` | Role:super_admin | — | `ApiResponse<RolePermission[]>` | |
| POST | `/role-permissions` | Role:super_admin | `{roleId, permissionId}` | `ApiResponse<RolePermission>` | |
| DELETE | `/role-permissions/:id` | Role:super_admin | — | `ApiResponse<null>` | |

### Search Module

| Method | Path | Auth | Body | Response | Notes |
|--------|------|------|------|----------|-------|
| POST | `/search/history` | JWT | `{searchQuery, resultsCount?, filters?, clickedProductId?}` | `ApiResponse<SearchHistory>` | Save search query |
| GET | `/search/history` | JWT | — | `ApiResponse<SearchHistory[]>` | `?limit` |
| DELETE | `/search/history` | JWT | — | `ApiResponse<null>` | Clear all history |
| POST | `/search/recently-viewed/:productId` | JWT | — | `ApiResponse<RecentlyViewed>` | Add to recently viewed |
| GET | `/search/recently-viewed` | JWT | — | `ApiResponse<RecentlyViewed[]>` | `?limit` |
| POST | `/search/compare/:productId` | JWT | — | `ApiResponse<ProductComparison>` | Add to comparison |
| GET | `/search/compare` | JWT | — | `ApiResponse<ProductComparison>` | Get comparison list |
| DELETE | `/search/compare/:productId` | JWT | — | `ApiResponse<null>` | Remove from comparison |
| GET | `/search/recommendations` | JWT | — | `ApiResponse<ProductRecommendation[]>` | `?productId` |

---

## Validation Criteria

- [ ] All types compile with `npx tsc --noEmit`
- [ ] Every enum value matches the backend exactly (case-sensitive)
- [ ] Every entity interface has all fields from the corresponding backend entity
- [ ] Every DTO interface has all required/optional fields matching backend validation
- [ ] `ApiResponse<T>` and `ApiError` match the backend response interceptor exactly
- [ ] No `any` types used (use `unknown` or `Record<string, unknown>` instead)
