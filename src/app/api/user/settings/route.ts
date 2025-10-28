/**
 * PATCH /api/user/settings
 * Update user settings (e.g., display_rewards, show_on_leaderboard preferences)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface UpdateSettingsRequest {
  display_rewards?: boolean;
  show_on_leaderboard?: boolean;
}

export async function PATCH(request: NextRequest) {
  try {
    // Parse request body
    const body: UpdateSettingsRequest = await request.json();

    // Validate request body - at least one field must be present
    if (
      typeof body.display_rewards !== 'boolean' &&
      typeof body.show_on_leaderboard !== 'boolean'
    ) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'At least one setting field must be provided',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate individual fields if provided
    if (body.display_rewards !== undefined && typeof body.display_rewards !== 'boolean') {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'display_rewards must be a boolean value',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (body.show_on_leaderboard !== undefined && typeof body.show_on_leaderboard !== 'boolean') {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'show_on_leaderboard must be a boolean value',
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

    // Build update object dynamically
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.display_rewards !== undefined) {
      updateData.display_rewards = body.display_rewards;
    }

    if (body.show_on_leaderboard !== undefined) {
      updateData.show_on_leaderboard = body.show_on_leaderboard;
    }

    // Update user settings in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('display_rewards, show_on_leaderboard')
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

    console.log(`✅ Updated settings for user ${user.id}:`, updateData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        display_rewards: updatedUser.display_rewards,
        show_on_leaderboard: updatedUser.show_on_leaderboard,
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
