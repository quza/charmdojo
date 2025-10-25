import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updatePasswordSchema } from '@/lib/validations/auth';
import { formatAuthError } from '@/lib/utils/auth-errors';
import { UpdatePasswordRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: UpdatePasswordRequest = await request.json();

    // Validate request data
    const validation = updatePasswordSchema.safeParse(body);
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

    const { password } = validation.data;

    // Create Supabase client
    const supabase = await createClient();

    // Check if user is authenticated (has valid reset token)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid or expired reset link. Please request a new one.',
            code: 'invalid_token',
          },
        },
        { status: 401 }
      );
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      const authError = formatAuthError(error);
      return NextResponse.json(
        { error: { message: authError.message, code: authError.code } },
        { status: authError.statusCode }
      );
    }

    return NextResponse.json(
      {
        message: 'Password updated successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update password error:', error);
    const authError = formatAuthError(error);
    return NextResponse.json(
      { error: { message: authError.message, code: authError.code } },
      { status: authError.statusCode }
    );
  }
}

