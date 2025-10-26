/**
 * Retry Utility
 * 
 * Provides intelligent retry logic with exponential backoff for handling
 * transient failures in API calls and other async operations.
 */

export interface RetryOptions {
  /** Maximum number of attempts (including the first try). Default: 3 */
  maxAttempts?: number;
  /** Initial delay in milliseconds before first retry. Default: 1000ms */
  initialDelay?: number;
  /** Maximum delay in milliseconds between retries. Default: 10000ms */
  maxDelay?: number;
  /** Multiplier for exponential backoff. Default: 2 */
  backoffMultiplier?: number;
  /** Optional callback invoked on each retry attempt */
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Wraps an async operation with automatic retry logic
 * 
 * @param fn - The async function to execute with retry
 * @param options - Configuration options for retry behavior
 * @returns Promise that resolves with the function result or rejects after all retries exhausted
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchData(),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on final attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error; // Fail fast for non-retryable errors
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      // Optional callback for logging
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      console.warn(
        `⚠️ Retry attempt ${attempt}/${maxAttempts} after ${delay}ms delay. Error: ${lastError.message}`
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError!;
}

/**
 * Determines if an error should trigger a retry attempt
 * 
 * Retryable errors include:
 * - 5xx server errors (500-599)
 * - 429 rate limit errors
 * - Network errors (ECONNRESET, ETIMEDOUT, ENOTFOUND)
 * - Timeout errors
 * 
 * Non-retryable errors include:
 * - 4xx client errors (except 429)
 * - Authentication errors (401, 403)
 * - Not found errors (404)
 * 
 * @param error - The error to check
 * @returns true if the error should trigger a retry, false otherwise
 */
export function isRetryableError(error: any): boolean {
  // Network errors from Node.js
  if (error.code === 'ECONNRESET' || 
      error.code === 'ETIMEDOUT' || 
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED') {
    return true;
  }

  // HTTP status codes from various sources
  const status = error.response?.status || error.status || error.statusCode;
  
  if (status) {
    // Retry on server errors (5xx)
    if (status >= 500 && status < 600) {
      return true;
    }
    
    // Retry on rate limits (429)
    if (status === 429) {
      return true;
    }
    
    // Don't retry client errors (4xx except 429)
    if (status >= 400 && status < 500) {
      return false;
    }
  }

  // Timeout errors (various formats)
  if (error.name === 'TimeoutError' || 
      error.name === 'AbortError' ||
      error.message?.toLowerCase().includes('timeout')) {
    return true;
  }

  // OpenAI specific errors
  if (error.type === 'server_error' || error.type === 'rate_limit_error') {
    return true;
  }

  // Fetch API network errors
  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return true;
  }

  // Default to not retrying unknown errors
  return false;
}

/**
 * Sleep for specified milliseconds
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

