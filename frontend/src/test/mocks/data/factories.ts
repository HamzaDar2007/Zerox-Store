/**
 * Mock entity factories for tests.
 * All factories return minimal valid typed objects.
 */
import type {
  User,
  Conversation,
  Message,
  Dispute,
  Subscription,
  LoyaltyPoints,
  LoyaltyTier,
  LoyaltyTransaction,
  ReferralCode,
  Referral,
  SavedPaymentMethod,
  Payment,
  Refund,
  Warehouse,
  Inventory,
  InventoryTransfer,
  StockMovement,
  ProductBundle,
  BundleItem,
  ShippingZone,
  ShippingMethod,
  ShippingCarrier,
  ShippingRate,
  DeliverySlot,
  TaxZone,
  TaxRate,
  TaxClass,
  Voucher,
  Campaign,
  FlashSale,
  Notification,
  NotificationTemplate,
  NotificationPreference,
  Ticket,
  TicketMessage,
  TicketCategory,
  ReturnRequest,
  ReturnReason,
  Page,
  Banner,
  SystemSetting,
  FeatureFlag,
  AuditLog,
  UserActivityLog,
  BulkOperation,
  ImportExportJob,
  SeoMetadata,
  UrlRedirect,
  Language,
  Currency,
  Translation,
  Product,
  Order,
  Category,
  Review,
  SearchHistory,
  RecentlyViewed,
  ProductComparison,
} from '@/common/types';

let _id = 0;
const uid = () => `mock-${++_id}`;
const now = new Date().toISOString();

export function resetIdCounter() {
  _id = 0;
}

// ─── Helpers ─────────────────────────────────────────────────────────
export function apiResponse<T>(data: T, message = 'Success') {
  return { success: true, message, data, timestamp: now };
}

export function paginatedResponse<T>(items: T[], total?: number) {
  return apiResponse({
    items,
    total: total ?? items.length,
    page: 1,
    limit: 10,
    totalPages: Math.ceil((total ?? items.length) / 10),
  });
}

// ─── Core Entities ──────────────────────────────────────────────────
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: uid(), name: 'Test User', email: 'test@example.com', phone: null,
    role: 'customer' as never, isEmailVerified: true, emailVerifiedAt: now,
    phoneVerifiedAt: null, isActive: true, profileImage: null,
    dateOfBirth: null, gender: null, referralCode: null, lastLoginAt: now,
    lastLoginIp: null, loginAttempts: 0, lockedUntil: null,
    twoFactorEnabled: false, preferredLanguageId: null, preferredCurrencyId: null,
    deletedAt: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: uid(), name: 'Test Product', slug: 'test-product', sku: 'SKU001',
    description: 'A great product', shortDescription: null, barcode: null,
    price: 99.99, compareAtPrice: null, costPrice: null, currencyCode: 'USD',
    categoryId: uid(), brandId: null, sellerId: uid(), storeId: null,
    weight: null, weightUnit: null, dimensionLength: null, dimensionWidth: null,
    dimensionHeight: null, dimensionUnit: null, tags: [], metaTitle: null,
    metaDescription: null, status: 'active' as never, isDigital: false,
    isFeatured: false, isTaxable: true, totalSales: 0, totalRevenue: 0,
    averageRating: 0, totalReviews: 0, lowStockThreshold: 5,
    images: [], variants: [], createdAt: now, updatedAt: now,
    deletedAt: null, ...overrides,
  } as Product;
}

export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: uid(), orderNumber: 'ORD-001', userId: uid(), sellerId: uid(),
    storeId: null, status: 'pending' as never, subtotal: 100, taxAmount: 10,
    shippingAmount: 5, discountAmount: 0, totalAmount: 115, currencyCode: 'USD',
    shippingAddressId: uid(), billingAddressId: null, shippingMethodId: null,
    paymentMethod: 'cod' as never, isGift: false, giftMessage: null,
    customerNotes: null, internalNotes: null, estimatedDeliveryDate: null,
    deliveredAt: null, cancelledAt: null, cancellationReason: null,
    items: [], createdAt: now, updatedAt: now, deletedAt: null,
    ...overrides,
  } as Order;
}

export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: uid(), name: 'Test Category', slug: 'test-category',
    nameAr: null, description: null, descriptionAr: null,
    imageUrl: null, iconUrl: null, parentId: null, path: '',
    sortOrder: 0, isActive: true, isFeatured: false,
    metaTitle: null, metaDescription: null,
    createdAt: now, updatedAt: now, ...overrides,
  } as Category;
}

export function createMockReview(overrides: Partial<Review> = {}): Review {
  return {
    id: uid(), productId: uid(), userId: uid(), rating: 5,
    title: 'Great product', content: 'Loved it!', status: 'approved' as never,
    isVerifiedPurchase: true, helpfulCount: 3, unhelpfulCount: 0,
    sellerReply: null, sellerRepliedAt: null,
    createdAt: now, updatedAt: now, ...overrides,
  } as Review;
}

// ─── Communication ──────────────────────────────────────────────────
export function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: uid(), type: null, buyerId: uid(), sellerId: uid(), customerId: null,
    orderId: null, subject: 'Question about order', status: 'open' as never,
    lastMessageAt: now, customerUnreadCount: 0, storeUnreadCount: 0,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: uid(), conversationId: uid(), senderId: uid(),
    senderType: 'customer' as never, type: 'text' as never,
    content: 'Hello there', attachments: null, isRead: false,
    readAt: null, isSystem: false, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: uid(), userId: uid(), type: 'order_placed' as never,
    channel: 'in_app' as never, title: 'Order Placed', body: 'Your order was placed.',
    data: null, status: 'sent' as never, readAt: null, sentAt: now,
    errorMessage: null, createdAt: now, ...overrides,
  };
}

export function createMockNotificationTemplate(overrides: Partial<NotificationTemplate> = {}): NotificationTemplate {
  return {
    id: uid(), code: 'order_placed', name: 'Order Placed', type: 'transactional',
    channels: [], subject: 'Order Placed', body: 'Your order {{orderNumber}} was placed.',
    htmlBody: null, smsBody: null, pushTitle: null, pushBody: null,
    variables: ['orderNumber'], isActive: true, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockNotificationPreference(overrides: Partial<NotificationPreference> = {}): NotificationPreference {
  return {
    id: uid(), userId: uid(), type: 'order_placed', channel: 'email' as never,
    isEnabled: true, createdAt: now, updatedAt: now, ...overrides,
  };
}

// ─── Support ────────────────────────────────────────────────────────
export function createMockTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: uid(), ticketNumber: 'TKT-001', userId: uid(), categoryId: null,
    subject: 'Help needed', description: 'I need assistance', status: 'open' as never,
    priority: 'medium' as never, assignedTo: null, orderId: null, attachments: null,
    firstResponseAt: null, resolvedAt: null, closedAt: null,
    satisfactionRating: null, satisfactionFeedback: null,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockTicketMessage(overrides: Partial<TicketMessage> = {}): TicketMessage {
  return {
    id: uid(), ticketId: uid(), senderId: uid(),
    isStaff: false, message: 'Thanks!', attachments: null,
    isInternal: false, createdAt: now, ...overrides,
  } as TicketMessage;
}

export function createMockTicketCategory(overrides: Partial<TicketCategory> = {}): TicketCategory {
  return {
    id: uid(), name: 'General', description: null, parentId: null, isActive: true,
    sortOrder: 0, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockDispute(overrides: Partial<Dispute> = {}): Dispute {
  return {
    id: uid(), orderId: uid(), customerId: uid(), sellerId: uid(),
    disputeNumber: 'DSP-001', type: 'product_not_received' as never,
    status: 'open' as never, reason: 'Item not received',
    description: 'I did not receive my item', resolution: null,
    resolutionDetails: null, resolvedBy: null, resolvedAt: null,
    evidence: [], messages: [], createdAt: now, updatedAt: now, ...overrides,
  } as Dispute;
}

export function createMockReturn(overrides: Partial<ReturnRequest> = {}): ReturnRequest {
  return {
    id: uid(), returnNumber: 'RET-001', orderId: uid(), orderItemId: uid(),
    userId: uid(), reasonId: null, reasonDetails: null,
    type: 'return' as never, status: 'pending' as never, quantity: 1,
    refundAmount: null, resolution: null, reviewedBy: null, reviewedAt: null,
    reviewerNotes: null, customerNotes: null, receivedAt: null, completedAt: null,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockReturnReason(overrides: Partial<ReturnReason> = {}): ReturnReason {
  return {
    id: uid(), name: 'Defective', description: null, isActive: true,
    requiresImages: false, sortOrder: 0, createdAt: now, updatedAt: now, ...overrides,
  };
}

// ─── Subscriptions ──────────────────────────────────────────────────
export function createMockSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: uid(), userId: uid(), productId: uid(), variantId: null,
    quantity: 1, frequency: 'monthly' as never, deliveryAddressId: uid(),
    paymentMethodId: null, unitPrice: 29.99, discountPercentage: 0,
    nextDeliveryDate: now, lastOrderDate: null, status: 'active' as never,
    pausedAt: null, cancelledAt: null, cancellationReason: null,
    totalOrders: 3, totalSpent: 89.97, createdAt: now, updatedAt: now, ...overrides,
  };
}

// ─── Loyalty ────────────────────────────────────────────────────────
export function createMockLoyaltyPoints(overrides: Partial<LoyaltyPoints> = {}): LoyaltyPoints {
  return {
    id: uid(), userId: uid(), tierId: null, totalEarned: 500,
    totalRedeemed: 100, totalExpired: 0, availableBalance: 400,
    lifetimePoints: 500, tierRecalculatedAt: null, createdAt: now, updatedAt: now,
    ...overrides,
  };
}

export function createMockLoyaltyTier(overrides: Partial<LoyaltyTier> = {}): LoyaltyTier {
  return {
    id: uid(), name: 'Gold', minPoints: 100, maxPoints: 500,
    earnMultiplier: 1.5, benefits: null, iconUrl: null, colorHex: '#FFD700',
    sortOrder: 1, isActive: true, createdAt: now, ...overrides,
  };
}

export function createMockLoyaltyTransaction(overrides: Partial<LoyaltyTransaction> = {}): LoyaltyTransaction {
  return {
    id: uid(), userId: uid(), type: 'earned' as never,
    points: 50, balanceAfter: 450, referenceType: null, referenceId: null,
    description: 'Order reward', expiresAt: null, createdAt: now, ...overrides,
  };
}

export function createMockReferralCode(overrides: Partial<ReferralCode> = {}): ReferralCode {
  return {
    id: uid(), userId: uid(), code: 'REF-ABC123',
    totalReferrals: 3, totalPointsEarned: 150, isActive: true,
    createdAt: now, ...overrides,
  };
}

export function createMockReferral(overrides: Partial<Referral> = {}): Referral {
  return {
    id: uid(), referrerUserId: uid(), referredUserId: uid(),
    referralCodeId: uid(), status: 'completed' as never,
    pointsAwarded: 50, rewardedAt: now, qualifiedAt: now, createdAt: now,
    ...overrides,
  };
}

// ─── Payments ───────────────────────────────────────────────────────
export function createMockPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: uid(), orderId: uid(), userId: uid(), paymentNumber: 'PAY-001',
    amount: 115, currencyCode: 'USD', paymentMethod: 'card' as never,
    status: 'completed' as never, gatewayName: 'stripe',
    gatewayTransactionId: null, gatewayResponse: null, paidAt: now,
    failedAt: null, failureReason: null, refundedAmount: 0,
    metadata: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockRefund(overrides: Partial<Refund> = {}): Refund {
  return {
    id: uid(), paymentId: uid(), refundNumber: 'REF-001',
    amount: 50, reason: null, reasonDetails: null,
    status: 'pending' as never, gatewayRefundId: null,
    gatewayResponse: null, processedBy: null, processedAt: null,
    metadata: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockSavedPaymentMethod(overrides: Partial<SavedPaymentMethod> = {}): SavedPaymentMethod {
  return {
    id: uid(), userId: uid(), paymentMethod: 'card', nickname: 'My Visa',
    isDefault: true, cardLastFour: '4242', cardBrand: 'Visa',
    cardExpiryMonth: 12, cardExpiryYear: 2027, bankName: null,
    accountLastFour: null, walletProvider: null, walletId: null,
    expiresAt: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

// ─── Inventory ──────────────────────────────────────────────────────
export function createMockWarehouse(overrides: Partial<Warehouse> = {}): Warehouse {
  return {
    id: uid(), sellerId: null, name: 'Main Warehouse', code: 'WH-001',
    addressLine1: '123 Main St', addressLine2: null, city: 'New York',
    state: 'NY', postalCode: '10001', countryCode: 'US',
    latitude: null, longitude: null, contactName: 'John',
    contactPhone: null, contactEmail: null, isActive: true, isDefault: true,
    priority: 1, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockInventory(overrides: Partial<Inventory> = {}): Inventory {
  return {
    id: uid(), productId: uid(), productVariantId: null, warehouseId: uid(),
    quantityOnHand: 100, quantityReserved: 5, quantityAvailable: 95,
    lowStockThreshold: 10, reorderPoint: null, reorderQuantity: null,
    lastRestockedAt: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockTransfer(overrides: Partial<InventoryTransfer> = {}): InventoryTransfer {
  return {
    id: uid(), transferNumber: 'TRF-001', fromWarehouseId: uid(), toWarehouseId: uid(),
    status: 'pending' as never, note: null, initiatedBy: uid(),
    approvedBy: null, approvedAt: null, shippedAt: null, receivedAt: null,
    cancelledAt: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockStockMovement(overrides: Partial<StockMovement> = {}): StockMovement {
  return {
    id: uid(), inventoryId: uid(), type: 'adjustment' as never,
    quantity: 10, quantityBefore: 90, quantityAfter: 100,
    referenceType: null, referenceId: null, costPerUnit: null,
    note: 'Restock', createdBy: null, createdAt: now, ...overrides,
  };
}

// ─── Bundles ────────────────────────────────────────────────────────
export function createMockBundle(overrides: Partial<ProductBundle> = {}): ProductBundle {
  return {
    id: uid(), name: 'Starter Bundle', slug: 'starter-bundle',
    description: 'Great value bundle', imageUrl: null,
    discountType: 'percentage' as never, discountValue: 10,
    bundlePrice: 89.99, originalTotalPrice: 99.99,
    startsAt: null, endsAt: null, isActive: true, sellerId: null,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockBundleItem(overrides: Partial<BundleItem> = {}): BundleItem {
  return {
    id: uid(), bundleId: uid(), productId: uid(),
    variantId: null, quantity: 1, sortOrder: 0, ...overrides,
  };
}

// ─── Shipping ───────────────────────────────────────────────────────
export function createMockShippingZone(overrides: Partial<ShippingZone> = {}): ShippingZone {
  return {
    id: uid(), name: 'Domestic', description: 'US Shipping',
    countries: ['US'], states: [], postcodes: [], isDefault: true,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockShippingMethod(overrides: Partial<ShippingMethod> = {}): ShippingMethod {
  return {
    id: uid(), name: 'Standard Shipping', code: 'standard',
    type: 'flat_rate' as never, description: null, isActive: true,
    sortOrder: 0, estimatedDaysMin: 3, estimatedDaysMax: 7,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockShippingCarrier(overrides: Partial<ShippingCarrier> = {}): ShippingCarrier {
  return {
    id: uid(), name: 'FedEx', code: 'fedex', logo: null,
    trackingUrlTemplate: 'https://fedex.com/track/{tracking}',
    isActive: true, settings: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockShippingRate(overrides: Partial<ShippingRate> = {}): ShippingRate {
  return {
    id: uid(), shippingMethodId: uid(), shippingZoneId: uid(),
    rateType: 'flat' as never, baseRate: 9.99, perKgRate: null,
    perItemRate: null, minOrderAmount: null, maxOrderAmount: null,
    freeShippingThreshold: null, createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockDeliverySlot(overrides: Partial<DeliverySlot> = {}): DeliverySlot {
  return {
    id: uid(), name: 'Morning', startTime: '08:00', endTime: '12:00',
    daysOfWeek: [1, 2, 3, 4, 5], maxOrders: 50, additionalFee: 0,
    isActive: true, createdAt: now, updatedAt: now, ...overrides,
  };
}

// ─── Tax ────────────────────────────────────────────────────────────
export function createMockTaxZone(overrides: Partial<TaxZone> = {}): TaxZone {
  return {
    id: uid(), name: 'US Tax', countryCode: 'US', stateCode: null,
    city: null, postalCodePattern: null, isActive: true, createdAt: now,
    ...overrides,
  };
}

export function createMockTaxRate(overrides: Partial<TaxRate> = {}): TaxRate {
  return {
    id: uid(), taxClassId: uid(), taxZoneId: uid(), name: 'Standard Rate',
    rate: 8.875, priority: 1, isCompound: false, isShipping: false,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockTaxClass(overrides: Partial<TaxClass> = {}): TaxClass {
  return {
    id: uid(), name: 'Standard', description: null, isDefault: true,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

// ─── Marketing ──────────────────────────────────────────────────────
export function createMockVoucher(overrides: Partial<Voucher> = {}): Voucher {
  return {
    id: uid(), code: 'SAVE10', name: '10% Off', description: null,
    sellerId: null, type: 'percentage' as never, discountValue: 10,
    minOrderAmount: 0, maxDiscount: null, applicableTo: 'all' as never,
    applicableIds: null, totalLimit: null, perUserLimit: 1, usedCount: 0,
    firstOrderOnly: false, stackable: false, displayOnStore: true,
    currencyCode: 'USD', startsAt: now, expiresAt: now, isActive: true,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: uid(), name: 'Summer Sale', slug: 'summer-sale', description: null,
    type: 'seasonal' as never, bannerUrl: null, mobileBannerUrl: null,
    thumbnailUrl: null, discountPercentage: 20, startsAt: now, endsAt: now,
    isActive: true, isFeatured: false, metaTitle: null, metaDescription: null,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockFlashSale(overrides: Partial<FlashSale> = {}): FlashSale {
  return {
    id: uid(), name: 'Flash Deal', slug: 'flash-deal', description: null,
    bannerUrl: null, startsAt: now, endsAt: now, isActive: true,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

// ─── Search ─────────────────────────────────────────────────────────
export function createMockSearchHistory(overrides: Partial<SearchHistory> = {}): SearchHistory {
  return {
    id: uid(), userId: null, sessionId: null, searchQuery: 'laptop',
    resultsCount: 42, filters: null, clickedProductId: null,
    createdAt: now, ...overrides,
  };
}

export function createMockRecentlyViewed(overrides: Partial<RecentlyViewed> = {}): RecentlyViewed {
  return {
    id: uid(), userId: null, productId: uid(), viewCount: 1,
    lastViewedAt: now, createdAt: now, ...overrides,
  };
}

export function createMockComparison(overrides: Partial<ProductComparison> = {}): ProductComparison {
  return {
    id: uid(), userId: null, productIds: [uid(), uid()],
    comparisonKey: null, createdAt: now, ...overrides,
  };
}

// ─── CMS/Admin entities ─────────────────────────────────────────────
export function createMockPage(overrides: Partial<Page> = {}): Page {
  return {
    id: uid(), slug: 'about', title: 'About Us', content: '<p>About</p>',
    excerpt: null, metaTitle: null, metaDescription: null, parentId: null,
    sortOrder: 0, isPublished: true, publishedAt: now, authorId: null,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockBanner(overrides: Partial<Banner> = {}): Banner {
  return {
    id: uid(), title: 'Sale Banner', subtitle: null, imageUrl: '/banner.jpg',
    mobileImageUrl: null, linkUrl: null, linkType: null, linkTargetId: null,
    position: 'hero' as never, sortOrder: 0, startsAt: null, endsAt: null,
    isActive: true, viewCount: 0, clickCount: 0, createdAt: now, updatedAt: now,
    ...overrides,
  };
}

export function createMockSystemSetting(overrides: Partial<SystemSetting> = {}): SystemSetting {
  return {
    id: uid(), group: 'general', key: 'site_name', value: 'LabVerse',
    valueType: 'string', displayName: 'Site Name', description: null,
    isPublic: true, isEncrypted: false, updatedBy: null,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockFeatureFlag(overrides: Partial<FeatureFlag> = {}): FeatureFlag {
  return {
    id: uid(), name: 'dark_mode', description: 'Enable dark mode',
    isEnabled: true, rolloutPercentage: 100, conditions: null,
    enabledForRoles: null, enabledForUsers: null, updatedBy: null,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  return {
    id: uid(), userId: uid(), action: 'create' as never,
    entityType: 'product', entityId: uid(), oldValues: null,
    newValues: { name: 'New Product' }, changedFields: ['name'],
    ipAddress: '127.0.0.1', userAgent: null, sessionId: null,
    description: 'Created product', createdAt: now, ...overrides,
  };
}

export function createMockActivityLog(overrides: Partial<UserActivityLog> = {}): UserActivityLog {
  return {
    id: uid(), userId: uid(), sessionId: null, activityType: 'page_view',
    entityType: null, entityId: null, metadata: null, ipAddress: null,
    userAgent: null, deviceType: null, referrerUrl: null, pageUrl: '/',
    createdAt: now, ...overrides,
  };
}

export function createMockBulkOperation(overrides: Partial<BulkOperation> = {}): BulkOperation {
  return {
    id: uid(), userId: uid(), operationType: 'update' as never,
    entityType: 'product', status: 'completed' as never,
    entityIds: [], parameters: {}, totalCount: 10,
    successCount: 10, failureCount: 0, errorLog: null,
    startedAt: now, completedAt: now, createdAt: now, updatedAt: now,
    ...overrides,
  };
}

export function createMockJob(overrides: Partial<ImportExportJob> = {}): ImportExportJob {
  return {
    id: uid(), userId: uid(), type: 'import' as never,
    status: 'completed' as never, sourceFileUrl: null,
    resultFileUrl: null, totalRows: 100, processedRows: 100,
    successRows: 98, failedRows: 2, errorLog: null, errorSummary: null,
    options: null, startedAt: now, completedAt: now, createdAt: now, updatedAt: now,
    ...overrides,
  };
}

export function createMockSeoMetadata(overrides: Partial<SeoMetadata> = {}): SeoMetadata {
  return {
    id: uid(), entityType: 'product', entityId: uid(),
    metaTitle: 'Product Title', metaDescription: 'Description',
    metaKeywords: null, canonicalUrl: null, ogTitle: null,
    ogDescription: null, ogImageUrl: null, ogType: 'website',
    twitterCardType: null, twitterTitle: null, twitterDescription: null,
    twitterImageUrl: null, structuredData: null, robotsDirective: 'index, follow',
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockUrlRedirect(overrides: Partial<UrlRedirect> = {}): UrlRedirect {
  return {
    id: uid(), sourceUrl: '/old-page', targetUrl: '/new-page',
    redirectType: '301' as never, isActive: true, hitCount: 0,
    lastHitAt: null, createdBy: null, createdAt: now, ...overrides,
  };
}

export function createMockLanguage(overrides: Partial<Language> = {}): Language {
  return {
    id: uid(), code: 'en', name: 'English', nativeName: 'English',
    direction: 'ltr' as never, isDefault: true, isActive: true,
    sortOrder: 0, createdAt: now, ...overrides,
  };
}

export function createMockCurrency(overrides: Partial<Currency> = {}): Currency {
  return {
    id: uid(), code: 'USD', name: 'US Dollar', symbol: '$',
    symbolPosition: 'before', decimalPlaces: 2, thousandsSeparator: ',',
    decimalSeparator: '.', exchangeRate: 1, isDefault: true, isActive: true,
    createdAt: now, updatedAt: now, ...overrides,
  };
}

export function createMockTranslation(overrides: Partial<Translation> = {}): Translation {
  return {
    id: uid(), languageId: uid(), entityType: 'product',
    entityId: uid(), fieldName: 'name', translatedValue: 'منتج',
    isAutoTranslated: false, createdAt: now, updatedAt: now, ...overrides,
  };
}
