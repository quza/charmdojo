import { RateLimitInfo } from '@/types/auth';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

/**
 * Check rate limit for a given identifier (usually IP address)
 * @param identifier - Unique identifier (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit information
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitInfo {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      remaining: config.maxAttempts - 1,
      resetTime: newEntry.resetTime,
      blocked: false,
    };
  }

  // Entry exists and not expired
  if (entry.count >= config.maxAttempts) {
    return {
      remaining: 0,
      resetTime: entry.resetTime,
      blocked: true,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime,
    blocked: false,
  };
}

/**
 * Get IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

// Common rate limit configs
export const RATE_LIMITS = {
  AUTH_SIGNUP: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  AUTH_SIGNIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
};

