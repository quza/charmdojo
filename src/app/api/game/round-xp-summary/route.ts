import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { levelForXp } from '@/lib/game/xp-system';

export const dynamic = 'force-dynamic';

/**
 * GET /api/game/round-xp-summary?roundId={uuid}
 * 
 * Returns XP summary for a completed round
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

    // 2. Get roundId from query params
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get('roundId');

    if (!roundId) {
      return NextResponse.json(
        { error: 'Missing roundId parameter' },
        { status: 400 }
      );
    }

    // 3. Fetch round data with XP info
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('user_id, xp_before_round, xp_after_round, xp_gained, message_xp_sum, win_xp, streak_multiplier, result')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // 4. Verify user owns this round
    if (round.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 5. Calculate levels from XP
    const xpBefore = round.xp_before_round || 0;
    const xpAfter = round.xp_after_round || xpBefore + (round.xp_gained || 0);
    const levelBefore = levelForXp(xpBefore);
    const levelAfter = levelForXp(xpAfter);

    // 6. Return XP summary
    return NextResponse.json({
      messageXpSum: round.message_xp_sum || 0,
      winXp: round.win_xp || 0,
      streakMultiplier: round.streak_multiplier || 1.0,
      totalXpGained: round.xp_gained || 0,
      xpBefore,
      xpAfter,
      levelBefore,
      levelAfter,
      result: round.result,
    });
  } catch (error) {
    console.error('Error in /api/game/round-xp-summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

