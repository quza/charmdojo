/**
 * GET /api/chat/messages/[roundId]
 * Retrieve full conversation history for a round
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const supabase = await createClient();

    // Await params for Next.js 15+ compatibility
    const { roundId } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the round belongs to the user
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('id, user_id, girl_name, result, final_meter')
      .eq('id', roundId)
      .eq('user_id', user.id)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Fetch messages for the round
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('round_id', roundId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform messages for the response
    const transformedMessages = (messages || []).map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      successDelta: msg.success_delta,
      meterAfter: msg.meter_after,
      category: msg.category,
      timestamp: msg.created_at,
      isInstantFail: msg.is_instant_fail || false,
      failReason: msg.fail_reason,
    }));

    const response = {
      messages: transformedMessages,
      roundInfo: {
        id: round.id,
        girlName: round.girl_name,
        currentMeter: round.final_meter || 0,
        status: round.result || 'active',
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in /api/chat/messages/[roundId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


