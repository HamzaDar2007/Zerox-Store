import type {
  VoucherType,
  VoucherScope,
  CampaignType,
  BannerPosition,
  BannerLinkType,
  LoyaltyTransactionType,
  ReferralStatus,
  AuditAction,
  BulkOperationType,
  ImportJobType,
  JobStatus,
} from './enums';

// ─── Marketing ──────────────────────────────────────────────────────
export interface Voucher {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  sellerId: string | null;
  type: VoucherType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  applicableTo: VoucherScope;
  applicableIds: Record<string, unknown> | null;
  totalLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  firstOrderOnly: boolean;
  stackable: boolean;
  displayOnStore: boolean;
  currencyCode: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  type: CampaignType;
  bannerUrl: string | null;
  mobileBannerUrl: string | null;
  thumbnailUrl: string | null;
  discountPercentage: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  products?: CampaignProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignProduct {
  id: string;
  campaignId: string;
  productId: string;
  salePrice: number | null;
  discountPercentage: number | null;
  stockLimit: number | null;
  soldCount: number;
  sortOrder: number;
}

export interface FlashSale {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  bannerUrl: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  products?: FlashSaleProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface FlashSaleProduct {
  id: string;
  flashSaleId: string;
  productId: string;
  variantId: string | null;
  salePrice: number;
  originalPrice: number;
  stockLimit: number;
  soldCount: number;
  perUserLimit: number;
  sortOrder: number;
}

// ─── Loyalty ────────────────────────────────────────────────────────
export interface LoyaltyPoints {
  id: string;
  userId: string;
  tierId: string | null;
  tier?: LoyaltyTier;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  availableBalance: number;
  lifetimePoints: number;
  tierRecalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  earnMultiplier: number;
  benefits: Record<string, unknown> | null;
  iconUrl: string | null;
  colorHex: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: LoyaltyTransactionType;
  points: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referralCodeId: string;
  status: ReferralStatus;
  pointsAwarded: number;
  rewardedAt: string | null;
  qualifiedAt: string | null;
  createdAt: string;
}

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  totalReferrals: number;
  totalPointsEarned: number;
  isActive: boolean;
  createdAt: string;
}

// ─── CMS ────────────────────────────────────────────────────────────
export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  parentId: string | null;
  children?: Page[];
  sortOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  linkUrl: string | null;
  linkType: BannerLinkType | null;
  linkTargetId: string | null;
  position: BannerPosition;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── System ─────────────────────────────────────────────────────────
export interface SystemSetting {
  id: string;
  group: string;
  key: string;
  value: string | null;
  valueType: string;
  displayName: string | null;
  description: string | null;
  isPublic: boolean;
  isEncrypted: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  rolloutPercentage: number;
  conditions: Record<string, unknown> | null;
  enabledForRoles: string[] | null;
  enabledForUsers: string[] | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Audit ──────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  changedFields: string[] | null;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  description: string | null;
  createdAt: string;
}

export interface UserActivityLog {
  id: string;
  userId: string | null;
  sessionId: string | null;
  activityType: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: string | null;
  referrerUrl: string | null;
  pageUrl: string | null;
  createdAt: string;
}

// ─── Operations ─────────────────────────────────────────────────────
export interface BulkOperation {
  id: string;
  userId: string;
  operationType: BulkOperationType;
  entityType: string;
  status: JobStatus;
  entityIds: string[];
  parameters: Record<string, unknown>;
  totalCount: number;
  successCount: number;
  failureCount: number;
  errorLog: Record<string, unknown>[] | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportExportJob {
  id: string;
  userId: string;
  type: ImportJobType;
  status: JobStatus;
  sourceFileUrl: string | null;
  resultFileUrl: string | null;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  errorLog: Record<string, unknown>[] | null;
  errorSummary: string | null;
  options: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateVoucherDto {
  code: string;
  name?: string;
  description?: string;
  type: VoucherType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  applicableTo?: VoucherScope;
  totalLimit?: number;
  perUserLimit?: number;
  firstOrderOnly?: boolean;
  stackable?: boolean;
  displayOnStore?: boolean;
  startsAt: string;
  expiresAt: string;
}

export type UpdateVoucherDto = Partial<CreateVoucherDto>;

export interface CreateCampaignDto {
  name: string;
  slug?: string;
  description?: string;
  type?: CampaignType;
  bannerUrl?: string;
  mobileBannerUrl?: string;
  thumbnailUrl?: string;
  discountPercentage?: number;
  startsAt: string;
  endsAt: string;
  isFeatured?: boolean;
}

export interface CreateBannerDto {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkType?: BannerLinkType;
  linkTargetId?: string;
  position?: BannerPosition;
  sortOrder?: number;
  startsAt?: string;
  endsAt?: string;
}

export interface CreatePageDto {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  parentId?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface UpdateSystemSettingDto {
  value: string;
}

export interface CreateFeatureFlagDto {
  name: string;
  description?: string;
  isEnabled?: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, unknown>;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
}

// ─── Additional Admin DTOs ──────────────────────────────────────────
export interface CreateFlashSaleDto {
  name: string;
  startDate: string;
  endDate: string;
  productIds?: string[];
  discountPercentage?: number;
}

export interface CreateLoyaltyTransactionDto {
  userId: string;
  points: number;
  type: string;
  referenceId?: string;
  description?: string;
}

export interface CreateLoyaltyTierDto {
  name: string;
  requiredPoints: number;
  multiplier: number;
  benefits?: string[];
  sortOrder?: number;
}

export interface CreateSystemSettingDto {
  key: string;
  value: string;
  group?: string;
  description?: string;
  isPublic?: boolean;
}

export interface CreateBulkOperationDto {
  operationType: string;
  totalItems: number;
  payload: Record<string, unknown>;
}

export interface CreateImportExportJobDto {
  type: string;
  fileUrl?: string;
  options?: Record<string, unknown>;
}
