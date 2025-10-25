import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { signinSchema } from '@/lib/validations/auth';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { formatAuthError } from '@/lib/utils/auth-errors';
import { SigninRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);
    const rateLimitKey = `signin:${clientIp}`;

    // Check rate limit
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.AUTH_SIGNIN);

    if (rateLimit.blocked) {
      const minutesUntilReset = Math.ceil(
        (rateLimit.resetTime - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: {
            message: `Too many login attempts. Please try again in ${minutesUntilReset} minutes.`,
            code: 'rate_limit',
          },
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body: SigninRequest = await request.json();

    // Validate request data
    const validation = signinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: validation.error.issues[0].message,
            code: 'validation_error',
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const authError = formatAuthError(error);
      return NextResponse.json(
        { error: { message: authError.message, code: authError.code } },
        { status: authError.statusCode }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        {
          error: {
            message: 'Sign in failed. Please try again.',
            code: 'signin_failed',
          },
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signin error:', error);
    const authError = formatAuthError(error);
    return NextResponse.json(
      { error: { message: authError.message, code: authError.code } },
      { status: authError.statusCode }
    );
  }
}

