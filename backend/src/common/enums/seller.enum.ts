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
