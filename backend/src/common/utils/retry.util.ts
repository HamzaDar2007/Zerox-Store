import { Logger } from '@nestjs/common';

const logger = new Logger('RetryUtil');

/**
 * Retry an async operation with exponential backoff.
 * @param fn        The async function to retry
 * @param retries   Number of retry attempts (default: 3)
 * @param delayMs   Initial delay in ms (default: 500, doubles each attempt)
 * @param context   Logging context string
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500,
  context = 'RetryUtil',
): Promise<T> {
  let lastError: Error;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const waitMs = delayMs * Math.pow(2, attempt - 1);
        logger.warn(
          `${context} attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${waitMs}ms...`,
        );
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
  }
  logger.error(
    `${context} failed after ${retries} attempts: ${lastError.message}`,
  );
  throw lastError;
}
