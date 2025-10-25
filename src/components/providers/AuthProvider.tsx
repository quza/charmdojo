'use client';

import React, { createContext, useContext } from 'react';
import { useUser } from '@/hooks/useUser';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useUser();
  const [session, setSession] = React.useState(null);

  // Get session when user changes
  React.useEffect(() => {
    if (user) {
      // Session is managed by Supabase, we just expose user state
      setSession(null); // Session details are in httpOnly cookies
    } else {
      setSession(null);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

