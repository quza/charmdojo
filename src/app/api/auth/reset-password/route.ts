import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { passwordResetSchema } from '@/lib/validations/auth';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { PasswordResetRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);
    const rateLimitKey = `reset:${clientIp}`;

    // Check rate limit
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.PASSWORD_RESET);

    if (rateLimit.blocked) {
      const minutesUntilReset = Math.ceil(
        (rateLimit.resetTime - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: {
            message: `Too many reset attempts. Please try again in ${minutesUntilReset} minutes.`,
            code: 'rate_limit',
          },
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body: PasswordResetRequest = await request.json();

    // Validate request data
    const validation = passwordResetSchema.safeParse(body);
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

    const { email } = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // Get the app URL for the redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectTo = `${appUrl}/update-password`;

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    // Always return success for security (don't reveal if email exists)
    // Log the error internally if needed
    if (error) {
      console.error('Password reset error:', error);
    }

    return NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive a password reset link.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    // Still return success for security
    return NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive a password reset link.',
      },
      { status: 200 }
    );
  }
}

