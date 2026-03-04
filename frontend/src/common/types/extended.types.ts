import type {
  ShippingRateType,
  ShippingMethodType,
  SubscriptionFrequency,
  SubscriptionStatus,
  TextDirection,
  RedirectType,
  VoucherType,
} from './enums';

// ─── Shipping ───────────────────────────────────────────────────────
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
  type: ShippingMethodType | string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
  rates?: ShippingRate[];
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

export interface DeliverySlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  maxOrders: number | null;
  additionalFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Tax ────────────────────────────────────────────────────────────
export interface TaxZone {
  id: string;
  name: string;
  countryCode: string;
  stateCode: string | null;
  city: string | null;
  postalCodePattern: string | null;
  isActive: boolean;
  rates?: TaxRate[];
  createdAt: string;
}

export interface TaxClass {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  rates?: TaxRate[];
  createdAt: string;
  updatedAt: string;
}

export interface TaxRate {
  id: string;
  taxClassId: string;
  taxZoneId: string;
  name: string;
  rate: number;
  priority: number;
  isCompound: boolean;
  isShipping: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Subscriptions ──────────────────────────────────────────────────
export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  frequency: SubscriptionFrequency;
  deliveryAddressId: string;
  paymentMethodId: string | null;
  unitPrice: number;
  discountPercentage: number;
  nextDeliveryDate: string;
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

// ─── I18n ───────────────────────────────────────────────────────────
export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string | null;
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

// ─── SEO ────────────────────────────────────────────────────────────
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
  ogImageUrl: string | null;
  ogType: string;
  twitterCardType: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  structuredData: Record<string, unknown> | null;
  robotsDirective: string;
  createdAt: string;
  updatedAt: string;
}

export interface UrlRedirect {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  redirectType: RedirectType;
  isActive: boolean;
  hitCount: number;
  lastHitAt: string | null;
  createdBy: string | null;
  createdAt: string;
}

// ─── Bundles ────────────────────────────────────────────────────────
export interface ProductBundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  discountType: VoucherType;
  discountValue: number;
  bundlePrice: number | null;
  originalTotalPrice: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  sellerId: string | null;
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
}

// ─── Search ─────────────────────────────────────────────────────────
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
  productId: string;
  viewCount: number;
  lastViewedAt: string;
  createdAt: string;
}

export interface ProductComparison {
  id: string;
  userId: string | null;
  productIds: string[];
  comparisonKey: string | null;
  createdAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateShippingZoneDto {
  name: string;
  description?: string;
  countries?: string[];
  states?: string[];
  postcodes?: string[];
  isDefault?: boolean;
}

export interface CreateShippingMethodDto {
  name: string;
  code: string;
  type?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
}

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

export interface CreateShippingCarrierDto {
  name: string;
  code: string;
  logo?: string;
  trackingUrlTemplate?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export interface CreateTaxZoneDto {
  name: string;
  countryCode: string;
  stateCode?: string;
  city?: string;
  postalCodePattern?: string;
  isActive?: boolean;
}

export interface CreateTaxClassDto {
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface CreateTaxRateDto {
  taxClassId: string;
  taxZoneId: string;
  name: string;
  rate: number;
  priority?: number;
  isCompound?: boolean;
  isShipping?: boolean;
}

export interface CreateSubscriptionDto {
  productId: string;
  variantId?: string;
  quantity?: number;
  frequency: SubscriptionFrequency;
  deliveryAddressId: string;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionDto {
  quantity?: number;
  frequency?: SubscriptionFrequency;
  deliveryAddressId?: string;
  paymentMethodId?: string;
  status?: SubscriptionStatus;
}

export interface CreateLanguageDto {
  code: string;
  name: string;
  nativeName?: string;
  direction?: TextDirection;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateTranslationDto {
  languageId: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  translatedValue: string;
}

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

export interface CreateBundleDto {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  discountType?: VoucherType;
  discountValue: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
  items: { productId: string; variantId?: string; quantity?: number; sortOrder?: number }[];
}

export interface CreateSeoMetadataDto {
  entityType: string;
  entityId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  ogType?: string;
  structuredData?: Record<string, unknown>;
  robotsDirective?: string;
}

export interface CreateUrlRedirectDto {
  sourceUrl: string;
  targetUrl: string;
  redirectType?: RedirectType;
  isActive?: boolean;
}

export interface CreateDeliverySlotDto {
  shippingZoneId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isAvailable?: boolean;
}
