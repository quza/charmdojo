import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface UserStats {
  totalRounds: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalAchievements: number;
}

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

    // 2. Fetch user statistics from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('total_rounds, total_wins, total_losses, current_streak, best_streak, total_achievements')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user stats:', userError);
      return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
    }

    // 3. Calculate win rate (avoid division by zero)
    const totalGames = (userData.total_wins || 0) + (userData.total_losses || 0);
    const winRate = totalGames > 0 ? ((userData.total_wins || 0) / totalGames) * 100 : 0;

    // 4. Format and return statistics
    const stats: UserStats = {
      totalRounds: userData.total_rounds || 0,
      wins: userData.total_wins || 0,
      losses: userData.total_losses || 0,
      winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal place
      currentStreak: userData.current_streak || 0,
      bestStreak: userData.best_streak || 0,
      totalAchievements: userData.total_achievements || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Unexpected error in /api/user/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

