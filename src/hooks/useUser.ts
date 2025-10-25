'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { UseUserReturn } from '@/types/auth';
import { shouldRefreshSession } from '@/lib/supabase/session';

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setUser(session?.user ?? null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle session refresh
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Auto-refresh token 5 minutes before expiry
    const refreshInterval = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && shouldRefreshSession(session)) {
        try {
          await supabase.auth.refreshSession();
          console.log('Session refreshed automatically');
        } catch (err) {
          console.error('Error refreshing session:', err);
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      setUser(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
  };
}

