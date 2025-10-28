import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // 2. Check if user opted in to leaderboard
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('show_on_leaderboard, total_wins, current_streak, created_at')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // If user hasn't opted in to leaderboard, return null rank
    if (!userData.show_on_leaderboard) {
      return NextResponse.json({ rank: null });
    }

    // 3. Calculate rank by counting users with better standings
    // A user has better standing if:
    // - They have more total_wins, OR
    // - They have same total_wins but higher current_streak, OR
    // - They have same total_wins and current_streak but earlier created_at
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('show_on_leaderboard', true)
      .or(
        `total_wins.gt.${userData.total_wins},` +
        `and(total_wins.eq.${userData.total_wins},current_streak.gt.${userData.current_streak}),` +
        `and(total_wins.eq.${userData.total_wins},current_streak.eq.${userData.current_streak},created_at.lt.${userData.created_at})`
      );

    if (countError) {
      console.error('Error counting rank:', countError);
      return NextResponse.json({ error: 'Failed to calculate rank' }, { status: 500 });
    }

    // Rank is count of users ahead + 1
    const rank = (count || 0) + 1;

    return NextResponse.json({ rank });
  } catch (error) {
    console.error('Unexpected error in /api/user/rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

