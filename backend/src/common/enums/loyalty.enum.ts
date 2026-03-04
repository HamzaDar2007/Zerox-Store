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
