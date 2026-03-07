import type { ReviewStatus, ReviewReportReason } from './enums';

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
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateReviewDto {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

export type UpdateReviewDto = Partial<Omit<CreateReviewDto, 'productId'>>;

export interface ReportReviewDto {
  reason: ReviewReportReason;
  details?: string;
}

export interface RespondToReviewDto {
  sellerResponse: string;
}
