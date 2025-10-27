/**
 * POST /api/chat/message
 * Send user message and receive AI response with success meter update
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkMessageSafety } from '@/lib/ai/moderation';
import {
  generateChatResponse,
  calculateNewMeter,
  determineGameStatus,
} from '@/lib/ai/chat';
import {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatMessage,
} from '@/types/chat';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatMessageRequest = await request.json();
    const { roundId, message, conversationHistory = [] } = body;

    // Validate request
    if (!roundId || typeof roundId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid roundId' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid message' },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch round data from database
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .eq('user_id', user.id)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Check if round is already completed
    if (round.result) {
      return NextResponse.json(
        { error: 'Round already completed' },
        { status: 400 }
      );
    }

    // Get current meter value (use final_meter if set, otherwise initial_meter)
    const currentMeter = round.final_meter ?? round.initial_meter;

    // 🎮 CHEAT CODE: AEZAKMI - Instant Win
    if (trimmedMessage.toUpperCase() === 'AEZAKMI') {
      console.log('🎮 Cheat code activated: AEZAKMI - Instant Win!');
      
      const userMessageTimestamp = new Date().toISOString();
      
      // Save user message with cheat code
      const { data: userMessageData } = await supabase
        .from('messages')
        .insert({
          round_id: roundId,
          role: 'user',
          content: trimmedMessage,
          success_delta: 100 - currentMeter, // Jump to 100%
          meter_after: 100,
          category: 'excellent',
          reasoning: 'Cheat code activated',
          is_instant_fail: false,
        })
        .select()
        .single();

      // Save AI response
      const aiMessageTimestamp = new Date(Date.now() + 1000).toISOString();
      const { data: aiMessageData } = await supabase
        .from('messages')
        .insert({
          round_id: roundId,
          role: 'assistant',
          content: "Wait... did you just... 🤯 Okay I'm absolutely blown away. You're incredible! Let's meet up! 💕",
          success_delta: null,
          meter_after: 100,
          category: null,
          reasoning: null,
          is_instant_fail: false,
        })
        .select()
        .single();

      // Update round to won status
      const { error: updateError } = await supabase
        .from('game_rounds')
        .update({
          final_meter: 100,
          result: 'win',
          completed_at: new Date().toISOString(),
          message_count: round.message_count + 2,
        })
        .eq('id', roundId);
      
      if (updateError) {
        console.error('Failed to update game round (cheat code):', updateError);
        throw new Error('Failed to update game status');
      }
      
      console.log('🏆 Cheat code success: Round marked as won');

      // Return victory response
      return NextResponse.json<ChatMessageResponse>({
        userMessage: {
          id: userMessageData?.id || 'temp',
          content: trimmedMessage,
          timestamp: userMessageTimestamp,
          role: 'user',
        },
        aiResponse: {
          id: aiMessageData?.id || 'system',
          content: "Wait... did you just... 🤯 Okay I'm absolutely blown away. You're incredible! Let's meet up! 💕",
          timestamp: aiMessageTimestamp,
          role: 'assistant',
        },
        successMeter: {
          previous: currentMeter,
          delta: 100 - currentMeter,
          current: 100,
          category: 'excellent',
        },
        gameStatus: 'won',
      });
    }

    // STEP 1: Content Moderation
    console.log(`🔍 Checking message safety for round ${roundId}`);
    const moderationResult = await checkMessageSafety(trimmedMessage);

    if (!moderationResult.isSafe) {
      console.warn(`⚠️ Message flagged as unsafe:`, moderationResult);

      // Instant fail - set meter to 0
      const userMessageTimestamp = new Date().toISOString();

      // Save the flagged user message
      const { data: userMessageData } = await supabase
        .from('messages')
        .insert({
          round_id: roundId,
          role: 'user',
          content: trimmedMessage,
          success_delta: null,
          meter_after: 0,
          category: null,
          reasoning: null,
          is_instant_fail: true,
          fail_reason: moderationResult.failReason || 'offensive',
        })
        .select()
        .single();

      // Update round with loss result
      await supabase
        .from('game_rounds')
        .update({
          final_meter: 0,
          result: 'lose',
          completed_at: new Date().toISOString(),
          message_count: round.message_count + 1,
        })
        .eq('id', roundId);

      // Return instant fail response
      return NextResponse.json<ChatMessageResponse>(
        {
          userMessage: {
            id: userMessageData?.id || 'temp',
            content: trimmedMessage,
            timestamp: userMessageTimestamp,
            role: 'user',
          },
          aiResponse: {
            id: 'system',
            content: 'That was inappropriate. Game over.',
            timestamp: new Date().toISOString(),
            role: 'assistant',
          },
          successMeter: {
            previous: currentMeter,
            delta: -currentMeter, // Drop to 0
            current: 0,
            category: 'bad',
          },
          gameStatus: 'lost',
          instantFail: true,
          failReason: moderationResult.details,
        },
        { status: 403 }
      );
    }

    // STEP 2: Generate AI response with success delta
    console.log(`🤖 Generating AI response for round ${roundId}`);
    const aiOutput = await generateChatResponse({
      roundId,
      userMessage: trimmedMessage,
      conversationHistory,
      girlName: round.girl_name,
      girlPersona: round.girl_persona || 'playful',
      currentMeter,
      girlDescription: round.girl_description || undefined,
    });

    // STEP 3: Calculate new meter value
    const newMeter = calculateNewMeter(currentMeter, aiOutput.successDelta);
    const gameStatus = determineGameStatus(newMeter);

    console.log(`📊 Meter update: ${currentMeter}% → ${newMeter}% (${aiOutput.successDelta > 0 ? '+' : ''}${aiOutput.successDelta})`)

    // STEP 4: Save messages to database
    const userMessageTimestamp = new Date().toISOString();
    const aiMessageTimestamp = new Date(Date.now() + 1000).toISOString(); // 1 second after user

    // Save user message
    const { data: userMessageData } = await supabase
      .from('messages')
      .insert({
        round_id: roundId,
        role: 'user',
        content: trimmedMessage,
        success_delta: aiOutput.successDelta,
        meter_after: newMeter,
        category: aiOutput.category,
        reasoning: aiOutput.reasoning,
        is_instant_fail: false,
      })
      .select()
      .single();

    // Save AI response
    const { data: aiMessageData } = await supabase
      .from('messages')
      .insert({
        round_id: roundId,
        role: 'assistant',
        content: aiOutput.response,
        success_delta: null,
        meter_after: newMeter,
        category: null,
        reasoning: null,
        is_instant_fail: false,
      })
      .select()
      .single();

    // STEP 5: Update round with new meter and message count
    const updateData: any = {
      final_meter: newMeter,
      message_count: round.message_count + 2, // +2 for user and AI messages
    };

    // If game ended, update result and completion time
    if (gameStatus !== 'active') {
      updateData.result = gameStatus === 'won' ? 'win' : 'lose';
      updateData.completed_at = new Date().toISOString();
      
      console.log(`🎮 Game ended: ${gameStatus === 'won' ? 'Victory!' : 'Defeat'}`);
    }

    const { error: updateError } = await supabase
      .from('game_rounds')
      .update(updateData)
      .eq('id', roundId);
    
    if (updateError) {
      console.error('Failed to update game round:', updateError);
      throw new Error('Failed to update game status');
    }
    
    // For won games, verify the update completed successfully
    if (gameStatus === 'won') {
      const { data: verifyRound, error: verifyError } = await supabase
        .from('game_rounds')
        .select('result')
        .eq('id', roundId)
        .single();
      
      if (verifyError || verifyRound?.result !== 'win') {
        console.error('Failed to verify game round win status:', verifyError);
        // Still proceed with response, but log the issue
        console.warn('⚠️ Game marked as won but database verification failed');
      } else {
        console.log('✅ Verified: Round successfully marked as won in database');
      }
    }

    // STEP 6: Build and return response
    const response: ChatMessageResponse = {
      userMessage: {
        id: userMessageData?.id || 'temp',
        content: trimmedMessage,
        timestamp: userMessageTimestamp,
        role: 'user',
      },
      aiResponse: {
        id: aiMessageData?.id || 'temp',
        content: aiOutput.response,
        timestamp: aiMessageTimestamp,
        role: 'assistant',
      },
      successMeter: {
        previous: currentMeter,
        delta: aiOutput.successDelta,
        current: newMeter,
        category: aiOutput.category,
      },
      gameStatus,
    };

    return NextResponse.json<ChatMessageResponse>(response, { status: 200 });

  } catch (error: any) {
    console.error('Error in chat message endpoint:', error);

    // Handle specific error types
    if (error.message?.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    if (error.message?.includes('Failed to generate AI response')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



