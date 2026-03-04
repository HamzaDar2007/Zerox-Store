import type {
  VerificationStatus,
  PayoutFrequency,
  SellerDocType,
  DocStatus,
  ViolationSeverity,
  ViolationPenalty,
  WalletTransactionType,
} from './enums';

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
  createdAt: string;
  updatedAt: string;
}

export interface StoreFollower {
  id: string;
  storeId: string;
  userId: string;
  followedAt: string;
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
  issuedBy: string | null;
  appealedAt: string | null;
  appealNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
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

// ─── Seller DTOs ────────────────────────────────────────────────────
export interface BecomeSellerDto {
  businessName: string;
  businessNameAr?: string;
  cnic?: string;
  cnicFrontImage?: string;
  cnicBackImage?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountTitle?: string;
  bankIban?: string;
}

export interface CreateStoreDto {
  name: string;
  slug?: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
}

export type UpdateStoreDto = Partial<CreateStoreDto>;

export interface UpdateSellerDto {
  businessName?: string;
  businessNameAr?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountTitle?: string;
  bankIban?: string;
  bankSwift?: string;
  vacationMode?: boolean;
  vacationStartDate?: string;
  vacationEndDate?: string;
}
