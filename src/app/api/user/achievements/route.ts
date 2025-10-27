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
 * Also checks for newly unlocked achievements before returning
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

    // 2. Check and unlock any newly earned achievements
    const newlyUnlocked = await checkAndUnlockAchievements(user.id);

    // 3. Get all achievements with unlock status
    const { achievements } = await getUserAchievements(user.id);

    // 4. Return response
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

