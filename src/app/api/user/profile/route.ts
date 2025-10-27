import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/validations/profile';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { name, avatar_url } = validation.data;

    // 3. Prepare update data
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }

    // 4. Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    if (!updatedUser.user) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated user' },
        { status: 500 }
      );
    }

    // 5. Return updated user data
    return NextResponse.json({
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        name: updatedUser.user.user_metadata?.name || null,
        avatar_url: updatedUser.user.user_metadata?.avatar_url || null,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error in /api/user/profile PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

