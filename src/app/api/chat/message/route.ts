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
import {
  calculateMessageXp,
  calculateWinXp,
  getStreakMultiplier,
  calculateRoundTotalXp,
  levelForXp,
} from '@/lib/game/xp-system';

/**
 * Check if a message is a generic opener that should result in ghosting
 */
function checkGenericOpener(message: string): boolean {
  const trimmed = message.toLowerCase().trim().replace(/[?!.]+$/g, '');
  
  const genericOpeners = [
    'hi', 'hey', 'hello', 'sup', 'yo', 'heya', 'hiya',
    'whats up', "what's up", 'wassup', 'whatsup', 'wazzup',
    'how are you', 'hows it going', "how's it going",
    'hru', 'wyd', 'hey there', 'hi there', 'hello there'
  ];
  
  // Check if message is ONLY a generic opener with nothing else
  if (genericOpeners.includes(trimmed)) return true;
  
  // Check if message is very short and starts with generic opener
  if (trimmed.length < 15) {
    for (const opener of genericOpeners) {
      if (trimmed.startsWith(opener)) {
        const remainder = trimmed.slice(opener.length).trim();
        // If nothing meaningful after opener, it's generic
        if (remainder.length < 3) return true;
      }
    }
  }
  
  return false;
}

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

    // 🎮 CHECK FOR GENERIC OPENER GHOSTING (first message only)
    if (round.message_count === 0) {
      const isGenericOpener = checkGenericOpener(trimmedMessage);
      
      if (isGenericOpener) {
        console.log('👻 Generic opener detected - User gets ghosted');
        
        const userMessageTimestamp = new Date().toISOString();
        
        // Save user message
        await supabase.from('messages').insert({
          round_id: roundId,
          role: 'user',
          content: trimmedMessage,
          success_delta: -20,
          meter_after: 0,
          category: 'bad',
          reasoning: 'Generic opener - ghosted',
          is_instant_fail: true,
          fail_reason: 'You got ghosted...',
          created_at: userMessageTimestamp,
        });
        
        // Update round to lost
        await supabase.from('game_rounds').update({
          result: 'lose',
          final_meter: 0,
          message_count: 1,
          completed_at: new Date().toISOString(),
        }).eq('id', roundId);
        
        // Return ghosted response (no AI message!)
        return NextResponse.json<ChatMessageResponse>({
          userMessage: {
            id: 'user-ghosted',
            content: trimmedMessage,
            timestamp: userMessageTimestamp,
            role: 'user',
          },
          aiResponse: null,
          successMeter: { 
            previous: currentMeter, 
            delta: -20, 
            current: 0, 
            category: 'bad' 
          },
          gameStatus: 'lost',
          ghosted: true,
        });
      }
    }

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

      // Update user statistics (same logic as normal win)
      try {
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('total_rounds, total_wins, total_losses, current_streak, best_streak')
          .eq('id', user.id)
          .single();

        if (!fetchError && currentUser) {
          const newCurrentStreak = currentUser.current_streak + 1;
          const newBestStreak = Math.max(currentUser.best_streak, newCurrentStreak);

          const { error: statsError } = await supabase
            .from('users')
            .update({
              total_rounds: currentUser.total_rounds + 1,
              total_wins: currentUser.total_wins + 1,
              current_streak: newCurrentStreak,
              best_streak: newBestStreak,
            })
            .eq('id', user.id);

          if (statsError) {
            console.error('Failed to update user stats (cheat code):', statsError);
          } else {
            console.log(`📊 User stats updated: Win recorded (cheat code), streak: ${newCurrentStreak}`);
          }
        }
      } catch (error) {
        console.error('Error updating user stats (cheat code):', error);
      }

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

      // Update user statistics for instant fail loss
      try {
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('total_rounds, total_wins, total_losses, current_streak, best_streak')
          .eq('id', user.id)
          .single();

        if (!fetchError && currentUser) {
          // Loss resets streak to 0
          const newCurrentStreak = 0;
          const newBestStreak = currentUser.best_streak; // Best streak never decreases

          const { error: statsError } = await supabase
            .from('users')
            .update({
              total_rounds: currentUser.total_rounds + 1,
              total_wins: currentUser.total_wins,
              total_losses: currentUser.total_losses + 1,
              current_streak: newCurrentStreak,
              best_streak: newBestStreak,
            })
            .eq('id', user.id);

          if (statsError) {
            console.error('Failed to update user stats (instant fail):', statsError);
          } else {
            console.log(`📊 User stats updated: Loss recorded (instant fail), streak reset to 0`);
          }
        }
      } catch (error) {
        console.error('Error updating user stats (instant fail):', error);
        // Don't throw - this shouldn't break the game flow
      }

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

    // STEP 3.5: Calculate and award message XP (if delta > 0)
    let messageXp = 0;
    let userCurrentXp = 0;
    let userCurrentLevel = 1;

    if (aiOutput.successDelta > 0) {
      // Fetch user's current XP and level
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('level, total_xp')
        .eq('id', user.id)
        .single();

      if (userFetchError) {
        console.error('Failed to fetch user XP data:', userFetchError);
      } else if (userData) {
        userCurrentLevel = userData.level || 1;
        userCurrentXp = userData.total_xp || 0;

        // Calculate message XP
        messageXp = calculateMessageXp(aiOutput.successDelta, userCurrentLevel);
        const newTotalXp = userCurrentXp + messageXp;
        const newLevel = levelForXp(newTotalXp);

        console.log(`✨ Message XP awarded: +${messageXp} XP (L${userCurrentLevel} → L${newLevel}, ${userCurrentXp} → ${newTotalXp} XP)`);

        // Update user's XP and level
        const { error: xpUpdateError } = await supabase
          .from('users')
          .update({
            total_xp: newTotalXp,
            level: newLevel,
          })
          .eq('id', user.id);

        if (xpUpdateError) {
          console.error('Failed to update user XP:', xpUpdateError);
        } else {
          userCurrentXp = newTotalXp;
          userCurrentLevel = newLevel;

          // Update message_xp_sum in game_rounds
          const { error: roundXpError } = await supabase
            .from('game_rounds')
            .update({
              message_xp_sum: (round.message_xp_sum || 0) + messageXp,
            })
            .eq('id', roundId);

          if (roundXpError) {
            console.error('Failed to update round message_xp_sum:', roundXpError);
          }
        }
      }
    }

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
        xp_gained: messageXp > 0 ? messageXp : null, // Store XP if awarded
      })
      .select()
      .single();

    // Save AI response(s) - handle multiple messages for double texting
    const aiResponses = aiOutput.multipleMessages || [aiOutput.response];
    const aiMessageDataArray: any[] = [];

    for (let i = 0; i < aiResponses.length; i++) {
      const { data: aiMessageData } = await supabase
        .from('messages')
        .insert({
          round_id: roundId,
          role: 'assistant',
          content: aiResponses[i],
          success_delta: null,
          meter_after: newMeter,
          category: null,
          reasoning: null,
          is_instant_fail: false,
          created_at: new Date(Date.now() + 1000 + (i * 500)).toISOString(), // Stagger by 500ms
        })
        .select()
        .single();
      
      if (aiMessageData) {
        aiMessageDataArray.push(aiMessageData);
      }
    }

    // STEP 5: Update round with new meter and message count
    const updateData: any = {
      final_meter: newMeter,
      message_count: round.message_count + 1 + aiResponses.length, // +1 for user + number of AI messages
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

    // STEP 5.5: Update user statistics and award win XP when game ends
    if (gameStatus !== 'active') {
      try {
        // Fetch current user stats and XP
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('total_rounds, total_wins, total_losses, current_streak, best_streak, level, total_xp')
          .eq('id', user.id)
          .single();

        if (fetchError || !currentUser) {
          console.error('Failed to fetch user stats for update:', fetchError);
        } else {
          const isWin = gameStatus === 'won';
          
          // Calculate new streak
          let newCurrentStreak = isWin ? currentUser.current_streak + 1 : 0;
          let newBestStreak = Math.max(currentUser.best_streak, newCurrentStreak);

          // Handle win XP and streak multiplier
          let winXp = 0;
          let streakMultiplier = 1.0;
          let endOfRoundBonus = 0;
          let finalXp = currentUser.total_xp;
          let finalLevel = currentUser.level;

          if (isWin) {
            // Get message_xp_sum from round
            const { data: roundData } = await supabase
              .from('game_rounds')
              .select('message_xp_sum')
              .eq('id', roundId)
              .single();

            const messageXpSum = roundData?.message_xp_sum || 0;

            // Calculate win XP with current level
            const currentLevel = currentUser.level || 1;
            winXp = calculateWinXp(currentLevel);

            // Get streak multiplier (for the new streak after this win)
            streakMultiplier = getStreakMultiplier(newCurrentStreak);

            // Calculate round total with multiplier
            const roundBase = messageXpSum + winXp;
            const roundTotal = calculateRoundTotalXp(messageXpSum, winXp, streakMultiplier);
            endOfRoundBonus = roundTotal - messageXpSum; // Already awarded message XP during game

            // Award end-of-round bonus
            finalXp = currentUser.total_xp + endOfRoundBonus;
            finalLevel = levelForXp(finalXp);

            console.log(`🏆 Win XP breakdown:`);
            console.log(`   Message XP: ${messageXpSum}`);
            console.log(`   Win XP: ${winXp}`);
            console.log(`   Streak: ${newCurrentStreak}x (${streakMultiplier.toFixed(1)}x multiplier)`);
            console.log(`   Round total: ${roundTotal} (base: ${roundBase})`);
            console.log(`   End-of-round bonus: +${endOfRoundBonus} XP`);
            console.log(`   Final: L${currentLevel} → L${finalLevel}, ${currentUser.total_xp} → ${finalXp} XP`);

            // Update game_rounds with XP info
            await supabase
              .from('game_rounds')
              .update({
                win_xp: winXp,
                streak_multiplier: streakMultiplier,
                xp_gained: roundTotal,
                xp_after_round: finalXp,
              })
              .eq('id', roundId);
          } else {
            // Loss: update game_rounds with just message XP (no win bonus)
            const { data: roundData } = await supabase
              .from('game_rounds')
              .select('message_xp_sum')
              .eq('id', roundId)
              .single();

            const messageXpSum = roundData?.message_xp_sum || 0;

            await supabase
              .from('game_rounds')
              .update({
                xp_gained: messageXpSum, // Only message XP
                xp_after_round: currentUser.total_xp,
              })
              .eq('id', roundId);

            console.log(`💀 Loss: No win XP, streak reset. Message XP: ${messageXpSum}`);
          }

          // Update user statistics
          const { error: statsError } = await supabase
            .from('users')
            .update({
              total_rounds: currentUser.total_rounds + 1,
              total_wins: isWin ? currentUser.total_wins + 1 : currentUser.total_wins,
              total_losses: isWin ? currentUser.total_losses : currentUser.total_losses + 1,
              current_streak: newCurrentStreak,
              best_streak: newBestStreak,
              total_xp: finalXp,
              level: finalLevel,
            })
            .eq('id', user.id);

          if (statsError) {
            console.error('Failed to update user stats:', statsError);
          } else {
            console.log(`📊 User stats updated: ${isWin ? 'Win' : 'Loss'} recorded, streak: ${newCurrentStreak}`);
          }
        }
      } catch (error) {
        console.error('Error updating user stats:', error);
        // Don't throw - this shouldn't break the game flow
      }

      // STEP 5.6: Check and unlock achievements
      try {
        const { checkAndUnlockAchievements } = await import('@/lib/services/achievement-service');
        const newlyUnlocked = await checkAndUnlockAchievements(user.id);
        if (newlyUnlocked.length > 0) {
          console.log(`🏆 Achievements unlocked: ${newlyUnlocked.join(', ')}`);
        }
      } catch (error) {
        console.error('Error checking achievements:', error);
        // Don't throw - this shouldn't break the game flow
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
        id: aiMessageDataArray[0]?.id || 'temp',
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
      disengaged: aiOutput.disengaged,
      multipleMessages: aiOutput.multipleMessages,
      // XP info for floating bubble animation
      xpGained: messageXp > 0 ? messageXp : undefined,
      currentXp: messageXp > 0 ? userCurrentXp : undefined,
      currentLevel: messageXp > 0 ? userCurrentLevel : undefined,
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

    // Handle quota exceeded errors
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return NextResponse.json(
        { error: 'AI quota exceeded. Please check your OpenAI billing and try again later.' },
        { status: 429 }
      );
    }

    // Handle other AI generation failures
    if (error.message?.includes('Failed to generate AI response')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



