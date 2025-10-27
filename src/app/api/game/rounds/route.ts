/**
 * GET /api/game/rounds
 * Fetch game history with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GameRound, RoundsResponse } from '@/types/game';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const result = searchParams.get('result'); // 'win' or 'lose'
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const cursor = searchParams.get('cursor'); // ISO timestamp for pagination

    // Validate result parameter
    if (result && result !== 'win' && result !== 'lose') {
      return NextResponse.json(
        { error: 'Invalid result parameter. Must be "win" or "lose"' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('game_rounds')
      .select('*')
      .eq('user_id', user.id)
      .not('result', 'is', null) // Only completed rounds
      .neq('is_abandoned', true) // Exclude abandoned rounds
      .order('started_at', { ascending: false })
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Filter by result if specified
    if (result) {
      query = query.eq('result', result);
    }

    // Apply cursor-based pagination
    if (cursor) {
      query = query.lt('started_at', cursor);
    }

    const { data: rounds, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching game rounds:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch game rounds' },
        { status: 500 }
      );
    }

    // Check if there are more results
    const hasMore = rounds.length > limit;
    const roundsToReturn = hasMore ? rounds.slice(0, limit) : rounds;

    // Get the cursor for next page (last item's started_at)
    const nextCursor = hasMore && roundsToReturn.length > 0
      ? roundsToReturn[roundsToReturn.length - 1].started_at
      : null;

    // Transform data to match GameRound interface
    const transformedRounds: GameRound[] = roundsToReturn.map(round => ({
      id: round.id,
      girlName: round.girl_name,
      girlImageUrl: round.girl_image_url,
      girlDescription: round.girl_description,
      girlPersona: round.girl_persona,
      result: round.result as 'win' | 'lose',
      finalMeter: round.final_meter ?? 0,
      messageCount: round.message_count,
      startedAt: round.started_at,
      completedAt: round.completed_at ?? round.started_at,
    }));

    const response: RoundsResponse = {
      rounds: transformedRounds,
      pagination: {
        hasMore,
        nextCursor,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in /api/game/rounds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


