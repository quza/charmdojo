/**
 * TypeScript types for reward generation system
 */

export interface RewardGenerationResult {
  rewardText: string;
  rewardVoiceUrl: string | null;
  rewardImageUrl: string | null;
  generationTime: number;
  breakdown: {
    textGeneration: number;
    voiceGeneration: number;
    imageGeneration: number;
  };
}

export interface GenerateRewardRequest {
  roundId: string;
}

export interface GenerateRewardResponse extends RewardGenerationResult {}

/**
 * Internal type for tracking individual asset generation
 */
export interface AssetGenerationTiming {
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}


