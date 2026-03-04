import type {
  PaymentMethod as PaymentMethodEnum,
  PaymentStatus,
  PaymentAttemptStatus,
  RefundStatus,
  RefundReason,
} from './enums';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  paymentNumber: string;
  amount: number;
  currencyCode: string;
  paymentMethod: PaymentMethodEnum;
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
  paymentMethod: string;
  nickname: string | null;
  isDefault: boolean;
  cardLastFour: string | null;
  cardBrand: string | null;
  cardExpiryMonth: number | null;
  cardExpiryYear: number | null;
  bankName: string | null;
  accountLastFour: string | null;
  walletProvider: string | null;
  walletId: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface ProcessPaymentDto {
  orderId: string;
  paymentMethod: PaymentMethodEnum;
  gatewayName?: string;
}

export interface CreateRefundDto {
  paymentId: string;
  amount: number;
  reason?: RefundReason;
  reasonDetails?: string;
}
