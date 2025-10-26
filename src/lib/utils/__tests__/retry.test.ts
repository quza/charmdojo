/**
 * Unit tests for retry utility
 */

import { withRetry, isRetryableError, sleep } from '../retry';

// Mock console methods to avoid cluttering test output
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('withRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt without retrying', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');

    const result = await withRetry(mockFn, { maxAttempts: 3 });

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on transient failures and eventually succeed', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(createError(500, 'Server Error'))
      .mockRejectedValueOnce(createError(503, 'Service Unavailable'))
      .mockResolvedValueOnce('success');

    const result = await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelay: 10, // Short delay for tests
    });

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max retries exhausted', async () => {
    const mockFn = jest.fn().mockRejectedValue(createError(500, 'Server Error'));

    await expect(
      withRetry(mockFn, {
        maxAttempts: 3,
        initialDelay: 10,
      })
    ).rejects.toThrow('Server Error');

    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should not retry on non-retryable errors', async () => {
    const mockFn = jest.fn().mockRejectedValue(createError(400, 'Bad Request'));

    await expect(
      withRetry(mockFn, {
        maxAttempts: 3,
        initialDelay: 10,
      })
    ).rejects.toThrow('Bad Request');

    // Should fail immediately without retry
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback on each retry attempt', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(createError(500, 'Error 1'))
      .mockRejectedValueOnce(createError(500, 'Error 2'))
      .mockResolvedValueOnce('success');

    const onRetry = jest.fn();

    await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelay: 10,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1);
    expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2);
  });

  it('should use exponential backoff', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(createError(500, 'Error'))
      .mockRejectedValueOnce(createError(500, 'Error'))
      .mockResolvedValueOnce('success');

    const delays: number[] = [];
    const startTime = Date.now();

    await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelay: 100,
      backoffMultiplier: 2,
      onRetry: () => {
        delays.push(Date.now() - startTime);
      },
    });

    // First retry after ~100ms, second after ~200ms (exponential)
    // Allow some tolerance for timing
    expect(delays[0]).toBeGreaterThanOrEqual(90);
    expect(delays[0]).toBeLessThan(150);
    expect(delays[1]).toBeGreaterThanOrEqual(290); // 100ms + 200ms
    expect(delays[1]).toBeLessThan(350);
  });

  it('should respect maxDelay cap', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(createError(500, 'Error'))
      .mockResolvedValueOnce('success');

    await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 500, // Cap at 500ms even though initial is 1000ms
      backoffMultiplier: 2,
    });

    // Should succeed, delay capped at maxDelay
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe('isRetryableError', () => {
  it('should identify 5xx errors as retryable', () => {
    expect(isRetryableError(createError(500, 'Internal Server Error'))).toBe(true);
    expect(isRetryableError(createError(502, 'Bad Gateway'))).toBe(true);
    expect(isRetryableError(createError(503, 'Service Unavailable'))).toBe(true);
    expect(isRetryableError(createError(504, 'Gateway Timeout'))).toBe(true);
  });

  it('should identify 429 rate limit as retryable', () => {
    expect(isRetryableError(createError(429, 'Too Many Requests'))).toBe(true);
  });

  it('should identify 4xx client errors as non-retryable', () => {
    expect(isRetryableError(createError(400, 'Bad Request'))).toBe(false);
    expect(isRetryableError(createError(401, 'Unauthorized'))).toBe(false);
    expect(isRetryableError(createError(403, 'Forbidden'))).toBe(false);
    expect(isRetryableError(createError(404, 'Not Found'))).toBe(false);
  });

  it('should identify network errors as retryable', () => {
    expect(isRetryableError({ code: 'ECONNRESET' })).toBe(true);
    expect(isRetryableError({ code: 'ETIMEDOUT' })).toBe(true);
    expect(isRetryableError({ code: 'ENOTFOUND' })).toBe(true);
    expect(isRetryableError({ code: 'ECONNREFUSED' })).toBe(true);
  });

  it('should identify timeout errors as retryable', () => {
    expect(isRetryableError({ name: 'TimeoutError' })).toBe(true);
    expect(isRetryableError({ name: 'AbortError' })).toBe(true);
    expect(isRetryableError(new Error('Request timeout exceeded'))).toBe(true);
  });

  it('should identify OpenAI specific errors', () => {
    expect(isRetryableError({ type: 'server_error' })).toBe(true);
    expect(isRetryableError({ type: 'rate_limit_error' })).toBe(true);
  });

  it('should identify fetch network errors as retryable', () => {
    const fetchError = new TypeError('fetch failed');
    expect(isRetryableError(fetchError)).toBe(true);
  });

  it('should default to non-retryable for unknown errors', () => {
    expect(isRetryableError(new Error('Unknown error'))).toBe(false);
    expect(isRetryableError({ random: 'error' })).toBe(false);
  });

  it('should handle errors with different status property names', () => {
    expect(isRetryableError({ status: 500 })).toBe(true);
    expect(isRetryableError({ statusCode: 500 })).toBe(true);
    expect(isRetryableError({ response: { status: 500 } })).toBe(true);
  });
});

describe('sleep', () => {
  it('should delay for specified milliseconds', async () => {
    const startTime = Date.now();
    await sleep(100);
    const endTime = Date.now();

    const elapsed = endTime - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some tolerance
    expect(elapsed).toBeLessThan(150);
  });

  it('should resolve after delay', async () => {
    const result = await sleep(50);
    expect(result).toBeUndefined();
  });
});

// Helper function to create mock errors
function createError(status: number, message: string): Error {
  const error: any = new Error(message);
  error.status = status;
  error.response = { status };
  return error;
}

