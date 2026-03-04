export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  FAKE_REVIEW = 'fake_review',
  OFFENSIVE = 'offensive',
  IRRELEVANT = 'irrelevant',
  OTHER = 'other',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

export enum ReviewReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  FAKE_REVIEW = 'fake_review',
  OFFENSIVE = 'offensive',
  IRRELEVANT = 'irrelevant',
  OTHER = 'other',
}

export enum ReviewReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACTIONED = 'actioned',
  DISMISSED = 'dismissed',
}
