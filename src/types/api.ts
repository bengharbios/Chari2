/**
 * API Response Types
 * Standard response formats for API endpoints
 */

// Success response wrapper
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Error response wrapper
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, string[]>;
}

// Combined API response type
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Pagination response meta
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
