# Retry Logic Utility

A production-ready retry utility with intelligent error detection and exponential backoff for handling transient failures in API calls.

## Overview

The retry utility automatically retries failed operations when it detects transient errors (like network issues, server errors, or rate limits) while failing fast on permanent errors (like authentication failures or invalid requests).

## Features

- ✅ **Exponential Backoff**: Progressively longer delays between retries (1s → 2s → 4s → 8s)
- ✅ **Intelligent Error Detection**: Automatically identifies which errors should trigger retries
- ✅ **Configurable**: Customize max attempts, delays, and backoff behavior
- ✅ **Type-Safe**: Full TypeScript support with generics
- ✅ **Logging Support**: Optional callbacks for tracking retry attempts
- ✅ **Production-Ready**: Handles edge cases and prevents infinite loops

## When Retries Happen

### ✅ Retryable Errors

The utility automatically retries these errors:

- **5xx Server Errors** (500, 502, 503, 504) - Server-side issues
- **429 Rate Limit** - Too many requests
- **Network Errors** - ECONNRESET, ETIMEDOUT, ENOTFOUND, ECONNREFUSED
- **Timeout Errors** - Request timeouts, AbortController aborts
- **OpenAI Errors** - server_error, rate_limit_error types
- **Fetch Errors** - Network failures from fetch API

### ❌ Non-Retryable Errors

These fail immediately without retry:

- **4xx Client Errors** (except 429) - Bad Request, Unauthorized, Forbidden, Not Found
- **Authentication Errors** (401, 403) - Invalid credentials or permissions
- **Invalid Data** (400) - Malformed requests
- **Unknown Errors** - Unrecognized error types (defaults to non-retryable)

## Basic Usage

```typescript
import { withRetry } from '@/lib/utils/retry';

// Simple usage with defaults (3 attempts, 1s initial delay)
const result = await withRetry(async () => {
  return await fetchData();
});
```

## Configuration Options

```typescript
interface RetryOptions {
  maxAttempts?: number;        // Default: 3
  initialDelay?: number;       // Default: 1000ms (1 second)
  maxDelay?: number;           // Default: 10000ms (10 seconds)
  backoffMultiplier?: number;  // Default: 2 (exponential)
  onRetry?: (error: Error, attempt: number) => void;
}
```

## Examples

### Image Generation (Patient Retry)

```typescript
import { withRetry } from '@/lib/utils/retry';
import { generateImage } from '@/lib/ai/imagen';

export async function generateGirlImage(params) {
  return withRetry(
    () => generateImage(params),
    {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 8000,
      onRetry: (error, attempt) => {
        console.warn(`🔄 Imagen retry ${attempt}: ${error.message}`);
      }
    }
  );
}
```

**Retry Schedule**: 1s → 2s → 4s (capped at 8s)

### Chat API (Fast Response)

```typescript
import { withRetry } from '@/lib/utils/retry';

export async function getAIChatResponse(messages) {
  return withRetry(
    () => openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages
    }),
    {
      maxAttempts: 2,      // Fewer retries for UX
      initialDelay: 500,   // Faster first retry
      maxDelay: 2000,      // Cap at 2s
    }
  );
}
```

**Retry Schedule**: 500ms → 1s (capped at 2s)

### Voice Generation (Tolerant)

```typescript
import { withRetry } from '@/lib/utils/retry';

export async function generateVoice(text: string) {
  return withRetry(
    () => elevenlabs.textToSpeech({ text }),
    {
      maxAttempts: 3,
      initialDelay: 2000,  // Voice generation is slow anyway
      maxDelay: 8000,
    }
  );
}
```

**Retry Schedule**: 2s → 4s → 8s

### Database Operations (Quick Feedback)

```typescript
import { withRetry } from '@/lib/utils/retry';

export async function saveToDatabase(data) {
  return withRetry(
    () => supabase.from('table').insert(data),
    {
      maxAttempts: 2,
      initialDelay: 300,
      maxDelay: 1000,
    }
  );
}
```

**Retry Schedule**: 300ms → 600ms (capped at 1s)

## Best Practices

### ✅ Do

- **Use for external API calls** - Network issues are common
- **Configure based on urgency** - User-facing operations need faster feedback
- **Add logging callbacks** - Track failures for debugging
- **Wrap single operations** - Each API call should have its own retry
- **Set reasonable timeouts** - Combine with AbortController for hard limits

### ❌ Don't

- **Don't retry user errors** - Invalid input won't fix itself
- **Don't retry indefinitely** - Always set maxAttempts
- **Don't nest retries** - Only wrap the atomic operation
- **Don't rely on retries for correctness** - They handle transience, not bugs
- **Don't use for local operations** - No need to retry in-memory operations

## Configuration by Service Type

| Service Type | Max Attempts | Initial Delay | Max Delay | Rationale |
|--------------|--------------|---------------|-----------|-----------|
| **Image Generation** | 3 | 1000ms | 8000ms | Not time-critical, worth thorough retry |
| **Chat/LLM** | 2 | 500ms | 2000ms | User waiting, need responsiveness |
| **Vision AI** | 2 | 500ms | 2000ms | User waiting for girl description |
| **Voice** | 3 | 2000ms | 8000ms | Generation already slow, can wait |
| **Database** | 2 | 300ms | 1000ms | Quick feedback needed |
| **File Upload** | 3 | 1000ms | 10000ms | Network-dependent, can be slow |

## Exponential Backoff Formula

```
delay = min(initialDelay * (backoffMultiplier ^ (attempt - 1)), maxDelay)

Example with defaults:
- Attempt 1: 1000ms * (2^0) = 1000ms (1s)
- Attempt 2: 1000ms * (2^1) = 2000ms (2s)
- Attempt 3: 1000ms * (2^2) = 4000ms (4s)
- Attempt 4: 1000ms * (2^3) = 8000ms (8s)
- Attempt 5: min(16000ms, 10000ms) = 10000ms (capped)
```

## Advanced: Custom Error Detection

If you need custom retry logic, you can combine `withRetry` with your own error handling:

```typescript
import { withRetry, isRetryableError } from '@/lib/utils/retry';

export async function customRetryOperation() {
  return withRetry(
    async () => {
      try {
        return await riskyOperation();
      } catch (error) {
        // Add custom error handling
        if (isSpecialError(error)) {
          // Transform or enhance error
          throw new Error(`Special case: ${error.message}`);
        }
        throw error;
      }
    },
    { maxAttempts: 3 }
  );
}
```

## Testing with Retries

When writing tests, use shorter delays:

```typescript
import { withRetry } from '@/lib/utils/retry';

test('should retry on failure', async () => {
  const mockFn = jest.fn()
    .mockRejectedValueOnce(new Error('Transient'))
    .mockResolvedValueOnce('success');

  const result = await withRetry(mockFn, {
    maxAttempts: 2,
    initialDelay: 10,  // Short delay for fast tests
  });

  expect(result).toBe('success');
  expect(mockFn).toHaveBeenCalledTimes(2);
});
```

## Troubleshooting

### Retries Not Happening

**Problem**: Function fails immediately without retrying

**Solution**: Check if error is detected as retryable. Add logging:

```typescript
await withRetry(
  () => operation(),
  {
    onRetry: (error, attempt) => {
      console.log('Retrying:', { error, attempt });
    }
  }
);
```

### Too Many Retries

**Problem**: Operation retries when it shouldn't

**Solution**: The error might be incorrectly classified as retryable. Check the error structure and adjust detection if needed.

### Timeout vs Retry Interaction

**Problem**: Timeouts trigger retries but take too long

**Solution**: Set timeout shorter than total retry time:

```typescript
// Timeout after 5s, but retry window is ~7s (1s + 2s + 4s)
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

await withRetry(
  () => operation({ signal: controller.signal }),
  { maxAttempts: 3, initialDelay: 1000 }
);
```

## Related Files

- **Core Implementation**: `src/lib/utils/retry.ts`
- **Unit Tests**: `src/lib/utils/__tests__/retry.test.ts`
- **Imagen Usage**: `src/lib/ai/imagen.ts`
- **OpenAI Usage**: `src/lib/ai/openai.ts`

## References

- [Exponential Backoff Pattern](https://en.wikipedia.org/wiki/Exponential_backoff)
- [Google Cloud Retry Strategy](https://cloud.google.com/apis/design/errors#error_retries)
- [AWS SDK Retry Behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

