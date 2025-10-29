/**
 * CharmDojo XP and Level System
 * Based on OSRS (Old School RuneScape) experience curve
 * 
 * Level range: 1-99
 * Max XP at 99: ~13,034,431
 */

// Constants
export const MAX_LEVEL = 99;
export const MIN_LEVEL = 1;

// Message XP base values by delta range
// Adjusted values for target progression:
// Early game (1-10): 1-2 rounds/level
// Mid game (10-40): 3-5 rounds/level
// Late game (40-70): 6-10 rounds/level
// End game (70-99): 11-20 rounds/level
export const MSG_BASE_TIERS = {
  t12: 2,    // Delta +1 or +2 (was 60, divided by 30)
  t34: 4,    // Delta +3 or +4 (was 120, divided by 30)
  t56: 7,    // Delta +5 or +6 (was 220, divided by ~31)
  t78: 12,   // Delta +7 or +8 (was 380, divided by ~32)
} as const;

export const MSG_EXPONENT = 0.15;
export const WIN_BASE = 50;  // (was 1600, divided by 32)
export const WIN_EXPONENT = 0.25;
export const STREAK_CAP = 2.0;

/**
 * Calculate total XP required for a given level using OSRS formula
 * Formula: total_xp_for_level(L) = floor( (Σ_{i=1..L-1} floor(i + 300 * 2^(i/7)) ) / 4 )
 * 
 * @param level - Target level (1-99)
 * @returns Total XP required to reach that level
 */
export function xpForLevel(level: number): number {
  if (level < MIN_LEVEL) return 0;
  if (level > MAX_LEVEL) level = MAX_LEVEL;

  let totalXp = 0;
  
  for (let i = 1; i < level; i++) {
    const xpDiff = Math.floor(i + 300 * Math.pow(2, i / 7));
    totalXp += xpDiff;
  }
  
  return Math.floor(totalXp / 4);
}

/**
 * Calculate current level based on total XP
 * 
 * @param totalXp - Player's total XP
 * @param maxLevel - Maximum level (default 99)
 * @returns Current level
 */
export function levelForXp(totalXp: number, maxLevel: number = MAX_LEVEL): number {
  if (totalXp < 0) return MIN_LEVEL;
  
  // Binary search for efficiency
  let low = MIN_LEVEL;
  let high = maxLevel;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const xpForMid = xpForLevel(mid);
    const xpForNext = xpForLevel(mid + 1);
    
    if (totalXp >= xpForMid && totalXp < xpForNext) {
      return mid;
    } else if (totalXp >= xpForNext) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return maxLevel;
}

/**
 * Message XP scaling function
 * msgScale(L) = L^0.15
 */
function msgScale(level: number): number {
  return Math.pow(level, MSG_EXPONENT);
}

/**
 * Win XP scaling function
 * winScale(L) = L^0.25
 */
function winScale(level: number): number {
  return Math.pow(level, WIN_EXPONENT);
}

/**
 * Get base XP for a message based on success delta
 * 
 * @param delta - Success delta (+1 to +8)
 * @returns Base XP (before level scaling)
 */
function getBaseXpForDelta(delta: number): number {
  const absDelta = Math.abs(delta);
  
  if (absDelta >= 7) return MSG_BASE_TIERS.t78;
  if (absDelta >= 5) return MSG_BASE_TIERS.t56;
  if (absDelta >= 3) return MSG_BASE_TIERS.t34;
  if (absDelta >= 1) return MSG_BASE_TIERS.t12;
  
  return 0;
}

/**
 * Calculate XP gained from a message
 * MsgXP = floor(BaseXP * msgScale(L))
 * 
 * @param delta - Success delta from the message
 * @param playerLevel - Player's current level
 * @returns XP gained (0 if delta <= 0)
 */
export function calculateMessageXp(delta: number, playerLevel: number): number {
  if (delta <= 0) return 0;
  
  const baseXp = getBaseXpForDelta(delta);
  const scaleFactor = msgScale(playerLevel);
  
  return Math.floor(baseXp * scaleFactor);
}

/**
 * Calculate XP gained from winning a round
 * WinXP = floor(WIN_BASE * winScale(L))
 * 
 * @param playerLevel - Player's level when winning
 * @returns Win XP
 */
export function calculateWinXp(playerLevel: number): number {
  const scaleFactor = winScale(playerLevel);
  return Math.floor(WIN_BASE * scaleFactor);
}

/**
 * Get streak multiplier based on consecutive wins
 * 
 * Streak ladder:
 * 1 win  → 1.1x
 * 2 wins → 1.2x
 * ...
 * 10+ wins → 2.0x (cap)
 * 
 * @param consecutiveWins - Number of consecutive wins (AFTER this win)
 * @returns Multiplier (1.0 - 2.0)
 */
export function getStreakMultiplier(consecutiveWins: number): number {
  if (consecutiveWins <= 0) return 1.0;
  if (consecutiveWins >= 10) return STREAK_CAP;
  
  return 1.0 + (consecutiveWins * 0.1);
}

/**
 * Calculate XP info for display (progress bar, etc.)
 * 
 * @param totalXp - Player's total XP
 * @returns XP info object
 */
export function calculateXpInfo(totalXp: number | undefined): {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  progress: number;
  currentLevelXp: number;
  nextLevelXp: number;
} {
  // Handle undefined/null/NaN cases
  const safeXp = totalXp === undefined || totalXp === null || isNaN(totalXp) ? 0 : totalXp;
  
  const level = levelForXp(safeXp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = level >= MAX_LEVEL ? currentLevelXp : xpForLevel(level + 1);
  
  const xpIntoLevel = safeXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  
  const progress = level >= MAX_LEVEL ? 100 : (xpIntoLevel / xpNeededForLevel) * 100;
  const xpToNextLevel = level >= MAX_LEVEL ? 0 : nextLevelXp - safeXp;
  
  return {
    level,
    totalXp: safeXp,
    xpToNextLevel,
    progress,
    currentLevelXp,
    nextLevelXp,
  };
}

/**
 * Format XP number with thousands separators
 * 
 * @param xp - XP amount
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatXp(xp: number | undefined): string {
  if (xp === undefined || xp === null || isNaN(xp)) {
    return '0';
  }
  return xp.toLocaleString();
}

/**
 * Calculate total round XP with streak multiplier
 * 
 * @param messageXpSum - Sum of all message XP in the round
 * @param winXp - Win XP (0 if lost)
 * @param streakMultiplier - Streak multiplier (1.0 if lost)
 * @returns Total XP for the round
 */
export function calculateRoundTotalXp(
  messageXpSum: number,
  winXp: number,
  streakMultiplier: number
): number {
  const roundBase = messageXpSum + winXp;
  return Math.floor(roundBase * streakMultiplier);
}

