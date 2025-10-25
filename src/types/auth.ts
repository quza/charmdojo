import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Request types for auth endpoints
export interface PasswordResetRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

// Auth error type for user-friendly error handling
export interface AuthError {
  message: string;
  code?: string;
  statusCode: number;
}

// Rate limiting information
export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  blocked: boolean;
}
