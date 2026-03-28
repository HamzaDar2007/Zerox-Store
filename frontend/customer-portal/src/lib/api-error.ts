import { isAxiosError } from 'axios'
import type { ApiError } from '@/types'

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.message) {
      if (Array.isArray(data.message)) return data.message.join(', ')
      return data.message
    }
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
      return 'Network error. Please check your connection.'
    }
    const status = error.response.status
    if (status === 403) return 'You do not have permission to perform this action.'
    if (status === 404) return 'The requested resource was not found.'
    if (status === 409) return 'This conflicts with existing data.'
    if (status === 422) return 'Validation failed. Please check your input.'
    if (status === 429) return 'Too many requests. Please wait a moment and try again.'
    if (status >= 500) return 'Server error. Please try again later.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

const NON_RETRYABLE = new Set([400, 401, 403, 404, 409, 422])

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false
  if (isAxiosError(error) && error.response) {
    return !NON_RETRYABLE.has(error.response.status)
  }
  return true
}
