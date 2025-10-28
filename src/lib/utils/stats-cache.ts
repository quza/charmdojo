/**
 * Client-side cache for user stats and achievements
 * Only refreshes on sign-in and after game completion, not on every page load
 */

import { Achievement } from '@/types/achievement';

interface UserStats {
  totalRounds: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalAchievements: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  userId: string;
}

const STATS_CACHE_KEY = 'charmdojo_stats_cache';
const ACHIEVEMENTS_CACHE_KEY = 'charmdojo_achievements_cache';
const SHOULD_REFRESH_KEY = 'charmdojo_should_refresh';
const SHOULD_REFRESH_LEADERBOARD_KEY = 'charmdojo_should_refresh_leaderboard';

// Cache expiration: 24 hours (in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Get cached stats for a user
 * Returns null if cache is expired or doesn't exist
 */
export function getCachedStats(userId: string): UserStats | null {
  try {
    const cached = localStorage.getItem(STATS_CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry<UserStats> = JSON.parse(cached);
    
    // Check if cache is for the same user
    if (entry.userId !== userId) return null;

    // Check if cache has expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(STATS_CACHE_KEY);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error reading stats cache:', error);
    return null;
  }
}

/**
 * Set cached stats for a user
 */
export function setCachedStats(userId: string, stats: UserStats): void {
  try {
    const entry: CacheEntry<UserStats> = {
      data: stats,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Error setting stats cache:', error);
  }
}

/**
 * Get cached achievements for a user
 * Returns null if cache is expired or doesn't exist
 */
export function getCachedAchievements(userId: string): Achievement[] | null {
  try {
    const cached = localStorage.getItem(ACHIEVEMENTS_CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry<Achievement[]> = JSON.parse(cached);
    
    // Check if cache is for the same user
    if (entry.userId !== userId) return null;

    // Check if cache has expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(ACHIEVEMENTS_CACHE_KEY);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error reading achievements cache:', error);
    return null;
  }
}

/**
 * Set cached achievements for a user
 */
export function setCachedAchievements(userId: string, achievements: Achievement[]): void {
  try {
    const entry: CacheEntry<Achievement[]> = {
      data: achievements,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(ACHIEVEMENTS_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Error setting achievements cache:', error);
  }
}

/**
 * Mark that stats and achievements should be refreshed on next page load
 * Called after sign-in and after game completion
 */
export function markShouldRefresh(): void {
  try {
    localStorage.setItem(SHOULD_REFRESH_KEY, 'true');
  } catch (error) {
    console.error('Error marking should refresh:', error);
  }
}

/**
 * Check if stats and achievements should be refreshed
 * Returns true if refresh is needed, and clears the flag
 */
export function checkAndClearRefreshFlag(): boolean {
  try {
    const shouldRefresh = localStorage.getItem(SHOULD_REFRESH_KEY) === 'true';
    if (shouldRefresh) {
      localStorage.removeItem(SHOULD_REFRESH_KEY);
    }
    return shouldRefresh;
  } catch (error) {
    console.error('Error checking refresh flag:', error);
    return false;
  }
}

/**
 * Clear all cached data (e.g., on sign out)
 */
export function clearAllCache(): void {
  try {
    localStorage.removeItem(STATS_CACHE_KEY);
    localStorage.removeItem(ACHIEVEMENTS_CACHE_KEY);
    localStorage.removeItem(SHOULD_REFRESH_KEY);
    localStorage.removeItem(SHOULD_REFRESH_LEADERBOARD_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Mark that leaderboard should be refreshed on next page load
 * Called after game completion
 */
export function markShouldRefreshLeaderboard(): void {
  try {
    localStorage.setItem(SHOULD_REFRESH_LEADERBOARD_KEY, 'true');
  } catch (error) {
    console.error('Error marking should refresh leaderboard:', error);
  }
}

/**
 * Check if leaderboard should be refreshed
 * Returns true if refresh is needed, and clears the flag
 */
export function checkAndClearLeaderboardRefreshFlag(): boolean {
  try {
    const shouldRefresh = localStorage.getItem(SHOULD_REFRESH_LEADERBOARD_KEY) === 'true';
    if (shouldRefresh) {
      localStorage.removeItem(SHOULD_REFRESH_LEADERBOARD_KEY);
    }
    return shouldRefresh;
  } catch (error) {
    console.error('Error checking leaderboard refresh flag:', error);
    return false;
  }
}

