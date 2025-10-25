import { createClient } from './server';

/**
 * Get the current session (server-side only)
 * Use this in API routes and Server Components
 */
export async function getSession() {
  const supabase = await createClient();
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return session;
}

/**
 * Refresh the current session (server-side only)
 * Use this in API routes and Server Components
 */
export async function refreshSession() {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Error refreshing session:', error);
    return null;
  }

  return session;
}

/**
 * Get current user (server-side only)
 * Use this in API routes and Server Components
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

