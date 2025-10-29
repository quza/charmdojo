/**
 * Combo System for CharmDojo
 * 
 * Rewards consecutive successful messages with increasing multipliers
 * - Messages with delta >= +3 advance the combo
 * - Messages with delta 0 to +2 maintain the combo
 * - Messages with delta < 0 break the combo
 */

export const MAX_COMBO_LEVEL = 5;
export const COMBO_ADVANCE_THRESHOLD = 3; // Need +3 or higher to advance combo
export const MAX_DELTA_AFTER_COMBO = 14; // Cap multiplied delta at +14

/**
 * Combo multiplier progression
 */
const COMBO_MULTIPLIERS = {
  0: 1.0,   // No combo yet
  1: 1.2,   // First combo
  2: 1.4,   // Second combo
  3: 1.6,   // Third combo
  4: 1.8,   // Fourth combo
  5: 2.0,   // MAX COMBO (ON FIRE!)
} as const;

/**
 * Get the multiplier for a given combo level
 * @param comboLevel - Current combo level (0-5)
 * @returns Multiplier value (1.0 to 2.0)
 */
export function getComboMultiplier(comboLevel: number): number {
  const clamped = Math.max(0, Math.min(MAX_COMBO_LEVEL, comboLevel));
  return COMBO_MULTIPLIERS[clamped as keyof typeof COMBO_MULTIPLIERS];
}

/**
 * Apply combo multiplier to a success delta
 * Caps the result at MAX_DELTA_AFTER_COMBO
 * 
 * @param delta - Original success delta
 * @param comboLevel - Current combo level (0-5)
 * @returns Modified delta after multiplier (capped at +14)
 */
export function applyComboMultiplier(delta: number, comboLevel: number): number {
  if (delta <= 0) return delta; // Don't modify negative/zero deltas
  
  const multiplier = getComboMultiplier(comboLevel);
  const multipliedDelta = Math.floor(delta * multiplier);
  
  // Cap at maximum
  return Math.min(multipliedDelta, MAX_DELTA_AFTER_COMBO);
}

/**
 * Check if a delta should advance the combo
 * @param delta - Success delta
 * @returns True if combo should increase
 */
export function shouldAdvanceCombo(delta: number): boolean {
  return delta >= COMBO_ADVANCE_THRESHOLD;
}

/**
 * Check if a delta should break the combo
 * @param delta - Success delta
 * @returns True if combo should reset to 0
 */
export function shouldBreakCombo(delta: number): boolean {
  return delta < 0;
}

/**
 * Calculate the next combo level based on current level and delta
 * @param currentCombo - Current combo level
 * @param delta - Success delta
 * @returns New combo level
 */
export function calculateNextCombo(currentCombo: number, delta: number): number {
  if (shouldBreakCombo(delta)) {
    return 0;
  }
  
  if (shouldAdvanceCombo(delta)) {
    return Math.min(currentCombo + 1, MAX_COMBO_LEVEL);
  }
  
  // Maintain current combo for deltas 0-2
  return currentCombo;
}

/**
 * Get display text for combo indicator
 * @param comboLevel - Current combo level (0-5)
 * @returns Display text
 */
export function getComboDisplayText(comboLevel: number): string {
  if (comboLevel === 0) return 'Combo: 0';
  if (comboLevel === MAX_COMBO_LEVEL) return 'ON FIRE!';
  return `Combo: x${comboLevel}`;
}

/**
 * Get tooltip text for combo indicator
 * @param comboLevel - Current combo level (0-5)
 * @returns Tooltip text explaining the multiplier
 */
export function getComboTooltip(comboLevel: number): string {
  const multiplier = getComboMultiplier(comboLevel);
  
  if (comboLevel === 0) {
    return 'Success Meter unaffected';
  }
  
  if (comboLevel === MAX_COMBO_LEVEL) {
    return `Success Meter x${multiplier} - You're on fire!`;
  }
  
  return `Success Meter x${multiplier}`;
}

/**
 * Get color theme for combo level
 * Used for styling the combo indicator
 * 
 * @param comboLevel - Current combo level (0-5)
 * @returns Color theme object
 */
export function getComboColorTheme(comboLevel: number): {
  bg: string;
  text: string;
  glow: string;
} {
  switch (comboLevel) {
    case 0:
      return {
        bg: 'bg-neutral-800/50',
        text: 'text-neutral-400',
        glow: 'shadow-none',
      };
    case 1:
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        glow: 'shadow-lg shadow-blue-500/20',
      };
    case 2:
      return {
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        glow: 'shadow-lg shadow-purple-500/30',
      };
    case 3:
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        glow: 'shadow-lg shadow-orange-500/40',
      };
    case 4:
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        glow: 'shadow-lg shadow-red-500/50',
      };
    case 5:
      return {
        bg: 'bg-gradient-to-r from-orange-500/30 via-red-500/30 to-yellow-500/30',
        text: 'text-yellow-300',
        glow: 'shadow-xl shadow-orange-500/60',
      };
    default:
      return {
        bg: 'bg-neutral-800/50',
        text: 'text-neutral-400',
        glow: 'shadow-none',
      };
  }
}

