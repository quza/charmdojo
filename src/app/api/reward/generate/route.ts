/**
 * POST /api/reward/generate
 * Generate complete reward (text, voice, image) for a won game round
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { generateCompleteReward } from '@/lib/services/reward-service';
import { GenerateRewardRequest, GenerateRewardResponse } from '@/types/reward';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateRewardRequest = await request.json();
    const { roundId } = body;

    // Validate roundId
    if (!roundId || typeof roundId !== 'string') {
      return NextResponse.json(
        { 
          error: 'invalid_round_id',
          message: 'Round ID must be a valid UUID',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // UUID validation (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roundId)) {
      return NextResponse.json(
        {
          error: 'invalid_round_id',
          message: 'Round ID must be a valid UUID',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Fetch round data
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('id, user_id, result')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        {
          error: 'round_not_found',
          message: `Round with ID '${roundId}' not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Verify round belongs to authenticated user
    if (round.user_id !== user.id) {
      return NextResponse.json(
        {
          error: 'forbidden',
          message: 'Round does not belong to authenticated user',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Verify round result is 'win'
    if (round.result !== 'win') {
      console.log(`❌ Reward generation rejected: Round result is '${round.result}' (expected 'win')`);
      console.log(`   Round ID: ${roundId}`);
      console.log(`   This may indicate a race condition where the frontend requested the reward`);
      console.log(`   before the chat API finished updating the round status.`);
      
      return NextResponse.json(
        {
          error: 'round_not_won',
          message: 'Rewards can only be generated for won rounds',
          roundResult: round.result,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Check if reward already exists (use service role client to bypass RLS)
    const serviceClient = createServiceRoleClient();
    const { data: existingReward, error: rewardCheckError } = await serviceClient
      .from('rewards')
      .select('*')
      .eq('round_id', roundId)
      .maybeSingle();

    console.log(`🔍 Checking for existing reward for round ${roundId}`);
    console.log(`   Found existing: ${existingReward ? 'YES' : 'NO'}`);
    
    if (rewardCheckError) {
      console.error('Error checking for existing reward:', rewardCheckError);
      return NextResponse.json(
        {
          error: 'database_error',
          message: 'Failed to check for existing reward',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    if (existingReward) {
      console.log(`✓ Returning existing reward (created: ${existingReward.created_at})`);
      return NextResponse.json(
        {
          error: 'reward_already_exists',
          message: 'Reward has already been generated for this round',
          existingReward: {
            rewardText: existingReward.reward_text,
            rewardVoiceUrl: existingReward.reward_voice_url,
            rewardImageUrl: existingReward.reward_image_url,
            createdAt: existingReward.created_at,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Generate complete reward
    console.log(`\n🎁 Generating reward for round ${roundId}`);
    console.log(`   User: ${user.id}`);

    let rewardResult;
    try {
      rewardResult = await generateCompleteReward(roundId);
    } catch (error: any) {
      console.error('❌ Reward generation failed:', error);
      return NextResponse.json(
        {
          error: 'generation_failed',
          message: error.message || 'Failed to generate reward',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Save reward to database using service role client (already created above)
    // Use ON CONFLICT to handle race conditions gracefully
    const { data: savedReward, error: saveError } = await serviceClient
      .from('rewards')
      .upsert(
        {
          round_id: roundId,
          reward_text: rewardResult.rewardText,
          reward_voice_url: rewardResult.rewardVoiceUrl,
          reward_image_url: rewardResult.rewardImageUrl,
          generation_time: rewardResult.generationTime,
        },
        {
          onConflict: 'round_id', // Specify the unique column
          ignoreDuplicates: false, // Update if exists
        }
      )
      .select()
      .single();

    if (saveError || !savedReward) {
      console.error('❌ Failed to save reward to database:', saveError);
      return NextResponse.json(
        {
          error: 'database_error',
          message: 'Failed to save reward to database',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    console.log(`✅ Reward saved to database successfully`);

    // Return complete reward response
    const response: GenerateRewardResponse = {
      rewardText: rewardResult.rewardText,
      rewardVoiceUrl: rewardResult.rewardVoiceUrl,
      rewardImageUrl: rewardResult.rewardImageUrl,
      generationTime: rewardResult.generationTime,
      breakdown: rewardResult.breakdown,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('❌ Unexpected error in reward generation API:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


