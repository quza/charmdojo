import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkAndUnlockAchievements,
  getUserAchievements,
} from '@/lib/services/achievement-service';
import { AchievementsResponse } from '@/types/achievement';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/achievements
 * Returns all achievements with user's unlock status
 * Optionally checks for newly unlocked achievements before returning (controlled by checkNew query param)
 */
export async function GET(request: NextRequest) {
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

    // 2. Check if we should check for new achievements
    // By default, checkNew=false to avoid expensive checks on every page load
    const { searchParams } = new URL(request.url);
    const checkNew = searchParams.get('checkNew') === 'true';

    let newlyUnlocked: string[] = [];

    // 3. Only check and unlock achievements if explicitly requested
    if (checkNew) {
      console.log('Checking for newly unlocked achievements...');
      newlyUnlocked = await checkAndUnlockAchievements(user.id);
    } else {
      console.log('Skipping achievement check (using cached data)');
    }

    // 4. Get all achievements with unlock status
    const { achievements } = await getUserAchievements(user.id);

    // 5. Return response
    const response: AchievementsResponse = {
      achievements,
      newlyUnlocked,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in /api/user/achievements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

