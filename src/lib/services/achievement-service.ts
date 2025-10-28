/**
 * Achievement Service
 * Handles checking and unlocking of achievements
 */

import { createClient } from '@/lib/supabase/server';
import { Tables, TablesInsert } from '@/types/database';

type Achievement = Tables<'achievements'>;
type UserAchievement = Tables<'user_achievements'>;

/**
 * Check and unlock achievements for a user
 * Returns array of newly unlocked achievement keys
 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const newlyUnlocked: string[] = [];

  try {
    // Get all achievement definitions
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order');

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return [];
    }

    // Get user's already unlocked achievements
    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (unlockedError) {
      console.error('Error fetching unlocked achievements:', unlockedError);
      return [];
    }

    const unlockedIds = new Set(unlockedAchievements?.map((ua) => ua.achievement_id) || []);

    // Check each achievement
    for (const achievement of allAchievements || []) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      // Check if achievement should be unlocked
      const shouldUnlock = await checkAchievementCondition(userId, achievement.key);

      if (shouldUnlock) {
        // Unlock achievement
        const { error: insertError } = await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

        if (!insertError) {
          newlyUnlocked.push(achievement.key);
          console.log(`Achievement unlocked: ${achievement.key} for user ${userId}`);
        } else {
          console.error(`Error unlocking achievement ${achievement.key}:`, insertError);
        }
      }
    }

    // Update total_achievements count if any were unlocked
    if (newlyUnlocked.length > 0) {
      await updateTotalAchievementsCount(userId);
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error in checkAndUnlockAchievements:', error);
    return [];
  }
}

/**
 * Check if a specific achievement condition is met
 */
async function checkAchievementCondition(userId: string, achievementKey: string): Promise<boolean> {
  const supabase = await createClient();

  switch (achievementKey) {
    case 'young_rizzie': {
      // Win your first simulation (total_wins >= 1)
      const { data: user, error } = await supabase
        .from('users')
        .select('total_wins')
        .eq('id', userId)
        .single();

      return !error && user && user.total_wins >= 1;
    }

    case 'thats_3': {
      // Get a 3 charm winstreak (current_streak >= 3)
      const { data: user, error } = await supabase
        .from('users')
        .select('current_streak')
        .eq('id', userId)
        .single();

      return !error && user && user.current_streak >= 3;
    }

    case 'quick_closer': {
      // Win a simulation in fewer than 10 messages
      const { data: rounds, error } = await supabase
        .from('game_rounds')
        .select('message_count')
        .eq('user_id', userId)
        .eq('result', 'win')
        .lt('message_count', 10)
        .limit(1);

      return !error && rounds && rounds.length > 0;
    }

    case 'comeback_king': {
      // Win a simulation after the meter dropped below 10%
      const { data: winningRounds, error: roundsError } = await supabase
        .from('game_rounds')
        .select('id')
        .eq('user_id', userId)
        .eq('result', 'win');

      if (roundsError || !winningRounds || winningRounds.length === 0) {
        return false;
      }

      // Check if any winning round had a message with meter_after < 10
      for (const round of winningRounds) {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('meter_after')
          .eq('round_id', round.id)
          .lt('meter_after', 10)
          .limit(1);

        if (!messagesError && messages && messages.length > 0) {
          return true;
        }
      }

      return false;
    }

    case 'smooth_talker': {
      // Send 3 consecutive messages rated 'excellent' in one game
      const { data: rounds, error: roundsError } = await supabase
        .from('game_rounds')
        .select('id')
        .eq('user_id', userId);

      if (roundsError || !rounds) {
        return false;
      }

      // Check each round for 3 consecutive excellent messages
      for (const round of rounds) {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('category, role, created_at')
          .eq('round_id', round.id)
          .eq('role', 'user')
          .order('created_at', { ascending: true });

        if (messagesError || !messages) {
          continue;
        }

        // Check for 3 consecutive 'excellent' messages
        let consecutiveExcellent = 0;
        for (const message of messages) {
          if (message.category === 'excellent') {
            consecutiveExcellent++;
            if (consecutiveExcellent >= 3) {
              return true;
            }
          } else {
            consecutiveExcellent = 0;
          }
        }
      }

      return false;
    }

    case 'the_marathon': {
      // Win a simulation with more than 30 messages
      const { data: rounds, error } = await supabase
        .from('game_rounds')
        .select('message_count')
        .eq('user_id', userId)
        .eq('result', 'win')
        .gt('message_count', 30)
        .limit(1);

      return !error && rounds && rounds.length > 0;
    }

    case 'charm_master': {
      // Win 10 simulations total
      const { data: user, error } = await supabase
        .from('users')
        .select('total_wins')
        .eq('id', userId)
        .single();

      return !error && user && user.total_wins >= 10;
    }

    case 'untouchable': {
      // Get a 7 charm winstreak
      const { data: user, error } = await supabase
        .from('users')
        .select('current_streak')
        .eq('id', userId)
        .single();

      return !error && user && user.current_streak >= 7;
    }

    case 'student_of_the_game': {
      // Complete 5 simulations (win or lose)
      const { data: user, error } = await supabase
        .from('users')
        .select('total_rounds')
        .eq('id', userId)
        .single();

      return !error && user && user.total_rounds >= 5;
    }

    case 'legendary': {
      // Win 50 simulations total
      const { data: user, error } = await supabase
        .from('users')
        .select('total_wins')
        .eq('id', userId)
        .single();

      return !error && user && user.total_wins >= 50;
    }

    default:
      return false;
  }
}

/**
 * Get all achievements with user's unlock status
 */
export async function getUserAchievements(userId: string): Promise<{
  achievements: Array<{
    id: string;
    key: string;
    title: string;
    description: string;
    iconUrl: string;
    unlocked: boolean;
    unlockedAt: string | null;
    displayOrder: number;
  }>;
}> {
  const supabase = await createClient();

  try {
    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order');

    if (achievementsError) {
      throw achievementsError;
    }

    // Get user's unlocked achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);

    if (userAchievementsError) {
      throw userAchievementsError;
    }

    // Create a map of unlocked achievements
    const unlockedMap = new Map(
      userAchievements?.map((ua) => [ua.achievement_id, ua.unlocked_at]) || []
    );

    // Combine the data
    const achievements = (allAchievements || []).map((achievement) => ({
      id: achievement.id,
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      iconUrl: achievement.icon_url,
      unlocked: unlockedMap.has(achievement.id),
      unlockedAt: unlockedMap.get(achievement.id) || null,
      displayOrder: achievement.display_order,
    }));

    return { achievements };
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return { achievements: [] };
  }
}

/**
 * Update the total_achievements count in the users table
 */
async function updateTotalAchievementsCount(userId: string): Promise<void> {
  const supabase = await createClient();

  try {
    // Count user's achievements
    const { count, error: countError } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      throw countError;
    }

    // Update users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ total_achievements: count || 0 })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating total achievements count:', error);
  }
}

