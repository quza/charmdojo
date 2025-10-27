/**
 * Achievement type definitions for CharmDojo
 */

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  iconUrl: string;
  unlocked: boolean;
  unlockedAt: string | null;
  displayOrder: number;
}

export interface AchievementsResponse {
  achievements: Achievement[];
  newlyUnlocked: string[];
}

export type AchievementKey = 'young_rizzie' | 'thats_3' | 'quick_closer';

