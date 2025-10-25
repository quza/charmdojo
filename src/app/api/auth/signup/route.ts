import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { signupServerSchema } from '@/lib/validations/auth';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { formatAuthError } from '@/lib/utils/auth-errors';
import { SignupRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);
    const rateLimitKey = `signup:${clientIp}`;

    // Check rate limit
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.AUTH_SIGNUP);

    if (rateLimit.blocked) {
      const minutesUntilReset = Math.ceil(
        (rateLimit.resetTime - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: {
            message: `Too many signup attempts. Please try again in ${minutesUntilReset} minutes.`,
            code: 'rate_limit',
          },
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body: SignupRequest = await request.json();

    // Validate request data
    const validation = signupServerSchema.safeParse(body);
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

    const { email, password, name } = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      const authError = formatAuthError(error);
      return NextResponse.json(
        { error: { message: authError.message, code: authError.code } },
        { status: authError.statusCode }
      );
    }

    // Check if user creation failed
    if (!data.user) {
      return NextResponse.json(
        {
          error: {
            message: 'Failed to create account. Please try again.',
            code: 'signup_failed',
          },
        },
        { status: 500 }
      );
    }

    // If no session, email confirmation is required
    if (!data.session) {
      return NextResponse.json(
        {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name || name,
          },
          requiresEmailConfirmation: true,
          message: 'Please check your email to confirm your account.',
        },
        { status: 201 }
      );
    }

    // Return success response with session
    return NextResponse.json(
      {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name || name,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    const authError = formatAuthError(error);
    return NextResponse.json(
      { error: { message: authError.message, code: authError.code } },
      { status: authError.statusCode }
    );
  }
}

