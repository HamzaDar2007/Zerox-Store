// ─── User & Auth Enums ───────────────────────────────────────────────
export enum UserRole {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum LoginStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
}

// ─── Product Enums ──────────────────────────────────────────────────
export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  PUBLISHED = 'published',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  REJECTED = 'rejected',
}

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  COLOR = 'color',
  DATE = 'date',
}

export enum WarrantyType {
  BRAND = 'brand',
  SELLER = 'seller',
  MARKETPLACE = 'marketplace',
  NONE = 'none',
}

// ─── Seller Enums ───────────────────────────────────────────────────
export enum VerificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum SellerDocType {
  BUSINESS_LICENSE = 'business_license',
  TAX_CERTIFICATE = 'tax_certificate',
  ID_CARD = 'id_card',
  CNIC = 'cnic',
  BANK_STATEMENT = 'bank_statement',
  ADDRESS_PROOF = 'address_proof',
}

export enum DocStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum ViolationSeverity {
  WARNING = 'warning',
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export enum ViolationPenalty {
  WARNING = 'warning',
  LISTING_SUSPENDED = 'listing_suspended',
  ACCOUNT_SUSPENDED = 'account_suspended',
  FINE = 'fine',
  PERMANENT_BAN = 'permanent_ban',
}

export enum PayoutFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

// ─── Order Enums ────────────────────────────────────────────────────
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PARTIALLY_CANCELLED = 'partially_cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
  EXCHANGED = 'exchanged',
}

// ─── Payment Enums ──────────────────────────────────────────────────
export enum PaymentMethod {
  COD = 'cod',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  STRIPE = 'stripe',
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

export enum PaymentAttemptStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
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

// ─── Shipping Enums ─────────────────────────────────────────────────
export enum ShipmentStatus {
  PENDING = 'pending',
  LABEL_CREATED = 'label_created',
  PICKED_UP = 'picked_up',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED_TO_SENDER = 'returned_to_sender',
  SHIPPED = 'shipped',
}

export enum ShippingRateType {
  FLAT = 'flat',
  WEIGHT_BASED = 'weight_based',
  PRICE_BASED = 'price_based',
  ITEM_BASED = 'item_based',
  FREE = 'free',
}

export enum ShippingMethodType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day',
  ECONOMY = 'economy',
  PICKUP = 'pickup',
  FREIGHT = 'freight',
}

// ─── Return Enums ───────────────────────────────────────────────────
export enum ReturnType {
  RETURN = 'return',
  EXCHANGE = 'exchange',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ITEM_SHIPPED = 'item_shipped',
  ITEM_RECEIVED = 'item_received',
  INSPECTING = 'inspecting',
  REFUND_PROCESSED = 'refund_processed',
  EXCHANGED = 'exchanged',
  CLOSED = 'closed',
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum ReturnResolution {
  REFUND = 'refund',
  EXCHANGE = 'exchange',
  REPAIR = 'repair',
  STORE_CREDIT = 'store_credit',
}

export enum ReturnShipmentDirection {
  CUSTOMER_TO_WAREHOUSE = 'customer_to_warehouse',
  WAREHOUSE_TO_CUSTOMER = 'warehouse_to_customer',
}

export enum ReturnShipmentStatus {
  PENDING = 'pending',
  PENDING_PICKUP = 'pending_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  INSPECTING = 'inspecting',
  COMPLETED = 'completed',
}

// ─── Inventory Enums ────────────────────────────────────────────────
export enum StockMovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT_ADD = 'adjustment_add',
  ADJUSTMENT_SUBTRACT = 'adjustment_subtract',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  RESERVATION = 'reservation',
  RESERVATION_RELEASE = 'reservation_release',
  DAMAGE = 'damage',
  EXPIRED = 'expired',
}

export enum ReservationStatus {
  HELD = 'held',
  COMMITTED = 'committed',
  RELEASED = 'released',
  EXPIRED = 'expired',
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ─── Checkout Enums ─────────────────────────────────────────────────
export enum CheckoutStep {
  CART_REVIEW = 'cart_review',
  ADDRESS = 'address',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REVIEW = 'review',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

// ─── Notification Enums ─────────────────────────────────────────────
export enum NotificationType {
  ORDER_STATUS = 'order_status',
  PAYMENT_STATUS = 'payment_status',
  SHIPPING_UPDATE = 'shipping_update',
  PROMOTION = 'promotion',
  REVIEW_REQUEST = 'review_request',
  PRICE_DROP = 'price_drop',
  BACK_IN_STOCK = 'back_in_stock',
  SECURITY_ALERT = 'security_alert',
  SYSTEM = 'system',
  CHAT_MESSAGE = 'chat_message',
  SUPPORT_TICKET = 'support_ticket',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// ─── Chat Enums ─────────────────────────────────────────────────────
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  PRODUCT_LINK = 'product_link',
  ORDER_LINK = 'order_link',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum MessageSenderType {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  SUPPORT = 'support',
  SYSTEM = 'system',
}

export enum ConversationStatus {
  OPEN = 'open',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
  CLOSED = 'closed',
}

// ─── Review Enums ───────────────────────────────────────────────────
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

export enum ReviewReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  FAKE_REVIEW = 'fake_review',
  OFFENSIVE = 'offensive',
  IRRELEVANT = 'irrelevant',
  OTHER = 'other',
}

export enum ReviewReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACTIONED = 'actioned',
  DISMISSED = 'dismissed',
}

// ─── Ticket Enums ───────────────────────────────────────────────────
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  AWAITING_CUSTOMER = 'awaiting_customer',
  AWAITING_AGENT = 'awaiting_agent',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ─── Dispute Enums ──────────────────────────────────────────────────
export enum DisputeType {
  ITEM_NOT_RECEIVED = 'item_not_received',
  ITEM_NOT_AS_DESCRIBED = 'item_not_as_described',
  COUNTERFEIT = 'counterfeit',
  SELLER_NOT_RESPONDING = 'seller_not_responding',
  WRONG_ITEM = 'wrong_item',
  DAMAGED_ITEM = 'damaged_item',
  MISSING_PARTS = 'missing_parts',
  OTHER = 'other',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  ESCALATED = 'escalated',
  AWAITING_SELLER = 'awaiting_seller',
  AWAITING_BUYER = 'awaiting_buyer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum DisputeResolution {
  REFUND_BUYER = 'refund_buyer',
  SIDE_WITH_SELLER = 'side_with_seller',
  PARTIAL_REFUND = 'partial_refund',
  REPLACEMENT = 'replacement',
  MUTUAL_AGREEMENT = 'mutual_agreement',
  NO_ACTION = 'no_action',
}

// ─── Subscription Enums ─────────────────────────────────────────────
export enum SubscriptionFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  BIMONTHLY = 'bimonthly',
  QUARTERLY = 'quarterly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// ─── Marketing Enums ────────────────────────────────────────────────
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

// ─── Wallet Enums ───────────────────────────────────────────────────
export enum WalletTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  WITHDRAWAL = 'withdrawal',
  REFUND_CREDIT = 'refund_credit',
  COMMISSION_DEDUCTION = 'commission_deduction',
  PAYOUT = 'payout',
  ADJUSTMENT = 'adjustment',
  BONUS = 'bonus',
}

// ─── Loyalty Enums ──────────────────────────────────────────────────
export enum LoyaltyTransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
  BONUS = 'bonus',
  REFERRAL_BONUS = 'referral_bonus',
  REFUND_REVERSAL = 'refund_reversal',
}

export enum ReferralStatus {
  PENDING = 'pending',
  QUALIFIED = 'qualified',
  REWARDED = 'rewarded',
  EXPIRED = 'expired',
}

// ─── CMS Enums ──────────────────────────────────────────────────────
export enum BannerPosition {
  HOMEPAGE_HERO = 'homepage_hero',
  HOMEPAGE_MID = 'homepage_mid',
  HOMEPAGE_BOTTOM = 'homepage_bottom',
  CATEGORY_TOP = 'category_top',
  CATEGORY_SIDEBAR = 'category_sidebar',
  PRODUCT_SIDEBAR = 'product_sidebar',
  CHECKOUT_BANNER = 'checkout_banner',
  APP_SPLASH = 'app_splash',
  APP_POPUP = 'app_popup',
}

export enum BannerLinkType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand',
  CAMPAIGN = 'campaign',
  STORE = 'store',
  PAGE = 'page',
  EXTERNAL = 'external',
}

export enum RedirectType {
  PERMANENT_301 = '301',
  TEMPORARY_302 = '302',
  TEMPORARY_307 = '307',
}

export enum TextDirection {
  LTR = 'ltr',
  RTL = 'rtl',
}

// ─── Audit Enums ────────────────────────────────────────────────────
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUSPEND = 'suspend',
  RESTORE = 'restore',
  PASSWORD_CHANGE = 'password_change',
  SETTINGS_CHANGE = 'settings_change',
}

// ─── Bulk Operations Enums ──────────────────────────────────────────
export enum BulkOperationType {
  PRICE_UPDATE = 'price_update',
  STOCK_UPDATE = 'stock_update',
  STATUS_UPDATE = 'status_update',
  CATEGORY_UPDATE = 'category_update',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

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

// ─── Chat Enums (typed) ─────────────────────────────────────────────
export enum ConversationType {
  CUSTOMER_SELLER = 'customer_seller',
  CUSTOMER_SUPPORT = 'customer_support',
  SELLER_SUPPORT = 'seller_support',
}

// ─── Marketing Enums (extended) ─────────────────────────────────────
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

// ─── Wallet Enums (extended) ────────────────────────────────────────
export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

// ─── Dispute Enums (extended) ───────────────────────────────────────
export enum DisputePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DisputeEvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  RECEIPT = 'receipt',
  TRACKING_INFO = 'tracking_info',
  COMMUNICATION = 'communication',
  OTHER = 'other',
}

// ─── Payment Enums (extended) ───────────────────────────────────────
export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
  MANUAL = 'manual',
}

// ─── Search & Recommendation Enums ──────────────────────────────────
export enum RecommendationType {
  FREQUENTLY_BOUGHT_TOGETHER = 'frequently_bought_together',
  SIMILAR_PRODUCTS = 'similar_products',
  ALSO_VIEWED = 'also_viewed',
  TRENDING_IN_CATEGORY = 'trending_in_category',
  PERSONALIZED = 'personalized',
}
