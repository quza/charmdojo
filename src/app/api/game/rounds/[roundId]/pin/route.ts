/**
 * POST /api/game/rounds/[roundId]/pin
 * Pin a game round (only wins can be pinned)
 * 
 * DELETE /api/game/rounds/[roundId]/pin
 * Unpin a game round
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/game/rounds/[roundId]/pin
 * Pin a game round (only wins can be pinned)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify round exists, belongs to user, and is a win
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('id, user_id, result')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    if (round.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (round.result !== 'win') {
      return NextResponse.json(
        { error: 'Only won rounds can be pinned' },
        { status: 400 }
      );
    }

    // Insert pin (will fail gracefully if already pinned due to PRIMARY KEY constraint)
    const { error: pinError } = await supabase
      .from('pinned_rounds')
      .insert({ user_id: user.id, round_id: roundId });

    if (pinError) {
      // Check if it's a duplicate key error
      if (pinError.code === '23505') {
        return NextResponse.json(
          { message: 'Round already pinned', pinned: true },
          { status: 200 }
        );
      }
      console.error('Error pinning round:', pinError);
      return NextResponse.json(
        { error: 'Failed to pin round' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, pinned: true }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in pin API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/game/rounds/[roundId]/pin
 * Unpin a game round
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete pin
    const { error: unpinError } = await supabase
      .from('pinned_rounds')
      .delete()
      .eq('user_id', user.id)
      .eq('round_id', roundId);

    if (unpinError) {
      console.error('Error unpinning round:', unpinError);
      return NextResponse.json(
        { error: 'Failed to unpin round' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, pinned: false }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in unpin API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

