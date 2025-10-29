import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard';

export async function GET() {
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

    // 2. Fetch top players ordered by total XP (only those who opted in)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, avatar_url, level, total_xp, total_wins, total_rounds, current_streak, total_achievements')
      .eq('show_on_leaderboard', true)
      .order('total_xp', { ascending: false })
      .order('current_streak', { ascending: false }) // Tiebreaker: higher streak
      .order('created_at', { ascending: true }) // Tiebreaker: earlier user
      .limit(100);

    if (usersError) {
      console.error('Error fetching leaderboard data:', usersError);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // 3. Process and rank users
    const entries: LeaderboardEntry[] = users.map((userData, index) => {
      const totalGames = userData.total_rounds || 0;
      const successRatio = totalGames > 0 
        ? Math.round((userData.total_wins / totalGames) * 1000) / 10 // Round to 1 decimal
        : 0;

      return {
        rank: index + 1,
        userId: userData.id,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        level: userData.level || 1,
        totalXp: userData.total_xp || 0,
        totalWins: userData.total_wins || 0,
        successRatio,
        currentStreak: userData.current_streak || 0,
        totalAchievements: userData.total_achievements || 0,
      };
    });

    // 4. Find current user's rank
    const currentUserRank = entries.find(entry => entry.userId === user.id)?.rank;

    const response: LeaderboardResponse = {
      entries,
      currentUserRank,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in /api/leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

