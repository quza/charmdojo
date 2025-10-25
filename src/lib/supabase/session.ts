// Constants
export const SESSION_TIMEOUT_DAYS = 7;
export const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_DAYS * 24 * 60 * 60 * 1000;

/**
 * Validate if session is still valid
 */
export function validateSession(session: { expires_at?: number } | null): boolean {
  if (!session || !session.expires_at) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return session.expires_at > now;
}

/**
 * Get session expiry time
 */
export function getSessionExpiry(session: { expires_at?: number } | null): Date | null {
  if (!session || !session.expires_at) {
    return null;
  }

  return new Date(session.expires_at * 1000);
}

/**
 * Check if session should be refreshed (5 minutes before expiry)
 */
export function shouldRefreshSession(session: { expires_at?: number } | null): boolean {
  if (!session || !session.expires_at) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutesFromNow = now + 5 * 60;

  return session.expires_at < fiveMinutesFromNow;
}

