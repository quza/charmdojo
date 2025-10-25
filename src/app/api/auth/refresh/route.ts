import { getSession, refreshSession } from '@/lib/supabase/server-utils';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting map (in production, use Redis or similar)
const refreshAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userAttempts = refreshAttempts.get(userId);

  if (!userAttempts || now > userAttempts.resetAt) {
    // Reset or initialize rate limit
    refreshAttempts.set(userId, {
      count: 1,
      resetAt: now + 60000, // 1 minute
    });
    return true;
  }

  if (userAttempts.count >= 1) {
    return false; // Rate limit exceeded
  }

  userAttempts.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Too many refresh attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Refresh the session
    const newSession = await refreshSession();

    if (!newSession) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: {
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
        expires_at: newSession.expires_at,
      },
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

