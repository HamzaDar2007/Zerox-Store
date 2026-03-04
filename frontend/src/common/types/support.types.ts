import type {
  ReturnType,
  ReturnStatus,
  ReturnResolution,
  ReturnShipmentDirection,
  ReturnShipmentStatus,
  TicketStatus,
  TicketPriority,
  DisputeType,
  DisputeStatus,
  DisputeResolution,
} from './enums';

// ─── Returns ────────────────────────────────────────────────────────
export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  reasonId: string | null;
  reason?: ReturnReason;
  reasonDetails: string | null;
  type: ReturnType;
  status: ReturnStatus;
  quantity: number;
  refundAmount: number | null;
  resolution: ReturnResolution | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
  customerNotes: string | null;
  receivedAt: string | null;
  completedAt: string | null;
  images?: ReturnImage[];
  shipments?: ReturnShipment[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnReason {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  requiresImages: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnImage {
  id: string;
  returnRequestId: string;
  imageUrl: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ReturnShipment {
  id: string;
  returnRequestId: string;
  direction: ReturnShipmentDirection;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ReturnShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Tickets ────────────────────────────────────────────────────────
export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  categoryId: string | null;
  category?: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  orderId: string | null;
  attachments: Record<string, unknown>[] | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  satisfactionRating: number | null;
  satisfactionFeedback: string | null;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  children?: TicketCategory[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  isStaff: boolean;
  message: string;
  attachments: Record<string, unknown>[] | null;
  isInternal: boolean;
  createdAt: string;
}

// ─── Disputes ───────────────────────────────────────────────────────
export interface Dispute {
  id: string;
  disputeNumber: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  type: DisputeType;
  status: DisputeStatus;
  subject: string;
  description: string;
  disputedAmount: number | null;
  resolution: DisputeResolution | null;
  resolutionNotes: string | null;
  refundAmount: number | null;
  assignedTo: string | null;
  escalatedAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  messages?: DisputeMessage[];
  evidence?: DisputeEvidence[];
  createdAt: string;
  updatedAt: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  message: string;
  isInternal: boolean;
  attachments: Record<string, unknown>[] | null;
  readAt: string | null;
  createdAt: string;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submittedBy: string;
  type: string;
  fileUrl: string | null;
  description: string | null;
  createdAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateReturnRequestDto {
  orderId: string;
  orderItemId: string;
  reasonId?: string;
  reasonDetails?: string;
  type: ReturnType;
  quantity: number;
  customerNotes?: string;
  images?: string[];
}

export interface CreateTicketDto {
  categoryId?: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
  orderId?: string;
  attachments?: Record<string, unknown>[];
}

export interface ReplyTicketDto {
  message: string;
  attachments?: Record<string, unknown>[];
  isInternal?: boolean;
}

export interface CreateDisputeDto {
  orderId: string;
  type: DisputeType;
  subject: string;
  description: string;
  disputedAmount?: number;
}

export interface ResolveDisputeDto {
  resolution: DisputeResolution;
  resolutionNotes?: string;
  refundAmount?: number;
}

export interface CreateReturnReasonDto {
  name: string;
  description?: string;
  isActive?: boolean;
  requiresImages?: boolean;
  sortOrder?: number;
}

export interface CreateTicketCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}
