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

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}
