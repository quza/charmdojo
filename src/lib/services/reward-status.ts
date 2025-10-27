/**
 * Reward Generation Status Tracking
 * Tracks status of ongoing reward generations for frontend polling
 */

interface RewardStatus {
  roundId: string;
  status: 'generating' | 'retrying' | 'completed' | 'failed';
  message: string;
  attempt?: number;
  maxAttempts?: number;
  timestamp: number;
}

// In-memory store for reward generation status
// In production, this could be Redis or a database table
const statusStore = new Map<string, RewardStatus>();

/**
 * Set the status for a reward generation
 */
export function setRewardStatus(roundId: string, status: Omit<RewardStatus, 'roundId' | 'timestamp'>) {
  statusStore.set(roundId, {
    roundId,
    ...status,
    timestamp: Date.now(),
  });
}

/**
 * Get the status for a reward generation
 */
export function getRewardStatus(roundId: string): RewardStatus | null {
  return statusStore.get(roundId) || null;
}

/**
 * Clear the status for a reward generation
 */
export function clearRewardStatus(roundId: string): void {
  statusStore.delete(roundId);
}

/**
 * Clean up old status entries (older than 10 minutes)
 */
export function cleanupOldStatuses(): void {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  
  for (const [roundId, status] of statusStore.entries()) {
    if (status.timestamp < tenMinutesAgo) {
      statusStore.delete(roundId);
    }
  }
}

// Clean up old statuses every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldStatuses, 5 * 60 * 1000);
}

