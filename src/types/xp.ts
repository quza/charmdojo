/**
 * XP and Level System Type Definitions
 * Based on OSRS (Old School RuneScape) experience curve
 */

export interface XpInfo {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  progress: number; // 0-100 percentage
}

export interface MessageXpGain {
  xpGained: number;
  currentXp: number;
  currentLevel: number;
}

export interface RoundXpSummary {
  messageXpSum: number;
  winXp: number;
  streakMultiplier: number;
  totalXpGained: number;
  xpBefore: number;
  xpAfter: number;
  levelBefore: number;
  levelAfter: number;
}

export interface XpDisplayProps {
  level: number;
  currentXp: number;
  totalXp: number;
}

export interface FloatingXpBubbleProps {
  xp: number;
  onComplete: () => void;
}

