export enum DisputeType {
  ITEM_NOT_RECEIVED = 'item_not_received',
  ITEM_NOT_AS_DESCRIBED = 'item_not_as_described',
  COUNTERFEIT = 'counterfeit',
  SELLER_NOT_RESPONDING = 'seller_not_responding',
  WRONG_ITEM = 'wrong_item',
  DAMAGED_ITEM = 'damaged_item',
  MISSING_PARTS = 'missing_parts',
  OTHER = 'other',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  ESCALATED = 'escalated',
  AWAITING_SELLER = 'awaiting_seller',
  AWAITING_BUYER = 'awaiting_buyer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum DisputeResolution {
  REFUND_BUYER = 'refund_buyer',
  SIDE_WITH_SELLER = 'side_with_seller',
  PARTIAL_REFUND = 'partial_refund',
  REPLACEMENT = 'replacement',
  MUTUAL_AGREEMENT = 'mutual_agreement',
  NO_ACTION = 'no_action',
}

export enum DisputePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DisputeEvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  RECEIPT = 'receipt',
  TRACKING_INFO = 'tracking_info',
  COMMUNICATION = 'communication',
  OTHER = 'other',
}
