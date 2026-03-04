// ─── API Response Envelope ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  path: string;
  timestamp: string;
  details?: string[];
}

// ─── Pagination ───────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Common Base ──────────────────────────────────────────────────────
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt: string | null;
}
