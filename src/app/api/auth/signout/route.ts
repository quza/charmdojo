import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Sign out user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error);
      return NextResponse.json(
        {
          error: {
            message: 'Failed to sign out. Please try again.',
            code: 'signout_failed',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Signed out successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Failed to sign out. Please try again.',
          code: 'signout_failed',
        },
      },
      { status: 500 }
    );
  }
}

