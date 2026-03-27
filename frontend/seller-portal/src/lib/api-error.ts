import { isAxiosError } from 'axios'
import type { ApiError } from '@/types'

/**
 * Extract a user-friendly error message from any error thrown by the API layer.
 * Handles:
 *  - Axios errors with backend JSON body (NestJS shape: { message, statusCode, error })
 *  - Axios errors with no response (network / timeout)
 *  - Plain Error objects
 *  - Unknown thrown values
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    // Backend returned a JSON error body
    const data = error.response?.data as ApiError | undefined

    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ')
      }
      return data.message
    }

    // No response at all — network or timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
      return 'Network error. Please check your connection.'
    }

    // HTTP status without a message body
    const status = error.response.status
    if (status === 403) return 'You do not have permission to perform this action.'
    if (status === 404) return 'The requested resource was not found.'
    if (status === 409) return 'This conflicts with existing data.'
    if (status === 422) return 'Validation failed. Please check your input.'
    if (status >= 500) return 'Server error. Please try again later.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

/** Status codes that should never be retried by React Query */
const NON_RETRYABLE = new Set([400, 401, 403, 404, 409, 422])

/**
 * Smart retry function for React Query — skips retrying client errors.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false
  if (isAxiosError(error) && error.response) {
    return !NON_RETRYABLE.has(error.response.status)
  }
  return true
}
