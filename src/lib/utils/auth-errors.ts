import { AuthError } from '@/types/auth';

/**
 * Map Supabase error codes and messages to user-friendly messages
 */
export function formatAuthError(error: unknown): AuthError {
  // Default error
  const defaultError: AuthError = {
    message: 'An unexpected error occurred. Please try again.',
    statusCode: 500,
  };

  if (!error || typeof error !== 'object') {
    return defaultError;
  }

  const err = error as { message?: string; code?: string; status?: number };

  // Check for specific error patterns
  const message = err.message?.toLowerCase() || '';
  const code = err.code || '';

  // Email already registered
  if (
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('duplicate') ||
    code === '23505'
  ) {
    return {
      message: 'An account with this email already exists.',
      code: 'email_exists',
      statusCode: 409,
    };
  }

  // Invalid credentials
  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid password') ||
    message.includes('wrong password')
  ) {
    return {
      message: 'Invalid email or password.',
      code: 'invalid_credentials',
      statusCode: 401,
    };
  }

  // Email not confirmed
  if (message.includes('email not confirmed') || code === 'email_not_confirmed') {
    return {
      message: 'Please verify your email address before signing in.',
      code: 'email_not_confirmed',
      statusCode: 403,
    };
  }

  // Weak password
  if (
    message.includes('password') &&
    (message.includes('weak') ||
      message.includes('too short') ||
      message.includes('must contain'))
  ) {
    return {
      message:
        'Password must be at least 8 characters and contain uppercase, lowercase, and numbers.',
      code: 'weak_password',
      statusCode: 400,
    };
  }

  // Invalid email format
  if (message.includes('invalid email') || message.includes('email format')) {
    return {
      message: 'Please enter a valid email address.',
      code: 'invalid_email',
      statusCode: 400,
    };
  }

  // User not found
  if (message.includes('user not found') || code === 'user_not_found') {
    return {
      message: 'No account found with this email.',
      code: 'user_not_found',
      statusCode: 404,
    };
  }

  // Token expired
  if (
    message.includes('token expired') ||
    message.includes('expired') ||
    code === 'token_expired'
  ) {
    return {
      message: 'This reset link has expired. Please request a new one.',
      code: 'token_expired',
      statusCode: 410,
    };
  }

  // Invalid token
  if (message.includes('invalid token') || code === 'invalid_token') {
    return {
      message: 'This reset link is invalid. Please request a new one.',
      code: 'invalid_token',
      statusCode: 401,
    };
  }

  // Rate limit exceeded
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return {
      message: 'Too many attempts. Please try again later.',
      code: 'rate_limit',
      statusCode: 429,
    };
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return {
      message: 'Network error. Please check your connection and try again.',
      code: 'network_error',
      statusCode: 503,
    };
  }

  // Return original message if it exists
  if (err.message) {
    return {
      message: err.message,
      code: code || 'unknown',
      statusCode: err.status || 500,
    };
  }

  return defaultError;
}

