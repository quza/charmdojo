/**
 * PATCH /api/user/settings
 * Update user settings (e.g., display_rewards preference)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface UpdateSettingsRequest {
  display_rewards?: boolean;
}

export async function PATCH(request: NextRequest) {
  try {
    // Parse request body
    const body: UpdateSettingsRequest = await request.json();

    // Validate request body
    if (typeof body.display_rewards !== 'boolean') {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'display_rewards must be a boolean value',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Update user settings in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        display_rewards: body.display_rewards,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('display_rewards')
      .single();

    if (updateError) {
      console.error('Error updating user settings:', updateError);
      return NextResponse.json(
        {
          error: 'database_error',
          message: 'Failed to update settings',
          details: updateError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    console.log(`✅ Updated settings for user ${user.id}:`, {
      display_rewards: body.display_rewards,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        display_rewards: updatedUser.display_rewards,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Unexpected error in settings API:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

