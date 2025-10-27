'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface VictoryOverlayProps {
  roundId: string;
}

interface RewardData {
  rewardText: string;
  rewardVoiceUrl: string | null;
  rewardImageUrl: string | null;
  generationTime: number;
}

export function VictoryOverlay({ roundId }: VictoryOverlayProps) {
  const router = useRouter();
  
  // Read from game store
  const { girl, resetGame } = useGame();
  
  // Reward state
  const [reward, setReward] = useState<RewardData | null>(null);
  const [isLoadingReward, setIsLoadingReward] = useState(true);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Generating reward...');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
  // Confetti state
  const [showConfetti, setShowConfetti] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { width, height } = useWindowSize();
  
  // Use ref to prevent duplicate API calls (React Strict Mode workaround)
  const hasRequestedReward = useRef(false);

  // Fetch reward on mount
  useEffect(() => {
    // If we've already made the request, skip
    if (hasRequestedReward.current) {
      return;
    }
    
    hasRequestedReward.current = true;
    
    // Start polling for status updates
    let statusPollInterval: NodeJS.Timeout | null = null;
    
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/reward/status?roundId=${roundId}`);
        if (response.ok) {
          const statusData = await response.json();
          if (statusData.status === 'retrying') {
            setLoadingMessage('Re-trying reward generation');
          } else if (statusData.status === 'generating') {
            setLoadingMessage('Generating reward...');
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };
    
    async function fetchReward() {
      const maxRetries = 5;
      let retryCount = 0;
      let lastError: Error | null = null;
      
      // Start status polling every 2 seconds
      statusPollInterval = setInterval(pollStatus, 2000);
      
      // Add a small initial delay to allow database update to complete
      // This helps avoid the race condition where VictoryOverlay renders
      // before the chat API finishes updating the round result to 'win'
      await new Promise(resolve => setTimeout(resolve, 500));
      
      while (retryCount < maxRetries) {
        try {
          setIsLoadingReward(true);
          
          // Add exponential backoff delay (except for first attempt)
          if (retryCount > 0) {
            const delayMs = Math.min(1000 * Math.pow(2, retryCount - 1), 5000); // 1s, 2s, 4s, 5s, 5s
            console.log(`⏳ Retrying reward fetch in ${delayMs}ms (attempt ${retryCount + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
          
          const response = await fetch('/api/reward/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roundId }),
          });

          if (!response.ok) {
            // Check if reward already exists (409)
            if (response.status === 409) {
              const data = await response.json();
              if (data.existingReward) {
                setReward({
                  rewardText: data.existingReward.rewardText,
                  rewardVoiceUrl: data.existingReward.rewardVoiceUrl,
                  rewardImageUrl: data.existingReward.rewardImageUrl,
                  generationTime: 0,
                });
                if (statusPollInterval) clearInterval(statusPollInterval);
                return;
              }
            }
            
            // Get error details from API
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Failed to generate reward';
            
            // Check if this is a race condition - round not ready yet (status 425)
            if (response.status === 425 && errorData.shouldRetry) {
              console.warn(`⚠️ Round not ready yet (attempt ${retryCount + 1}/${maxRetries}) - retrying after delay`);
              lastError = new Error(errorMessage);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
              continue; // Retry
            }
            
            // Check if this is the "round not won" error (status 403)
            if (response.status === 403 && errorData.error === 'round_not_won') {
              console.warn(`⚠️ Round not marked as won yet (attempt ${retryCount + 1}/${maxRetries})`);
              lastError = new Error(errorMessage);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
              continue; // Retry
            }
            
            console.error('Reward generation API error:', {
              status: response.status,
              error: errorData.error,
              message: errorMessage,
            });
            
            throw new Error(errorMessage);
          }

          const data: RewardData = await response.json();
          console.log('✅ Reward received:', {
            hasText: !!data.rewardText,
            hasVoice: !!data.rewardVoiceUrl,
            hasImage: !!data.rewardImageUrl,
            imageUrl: data.rewardImageUrl,
          });
          setReward(data);
          if (statusPollInterval) clearInterval(statusPollInterval);
          return; // Success - exit retry loop
          
        } catch (error: any) {
          // If it's a "round not won" error, retry
          if (error.message.includes('Rewards can only be generated for won rounds')) {
            lastError = error;
            retryCount++;
            if (retryCount < maxRetries) {
              continue; // Retry
            }
          }
          
          // For other errors, fail immediately
          console.error('Error fetching reward:', error);
          console.error('Round ID:', roundId);
          console.error('Error details:', error.message, error.stack);
          setRewardError(error.message);
          if (statusPollInterval) clearInterval(statusPollInterval);
          return;
        } finally {
          setIsLoadingReward(false);
        }
      }
      
      // If we exhausted all retries
      console.error('Failed to fetch reward after', maxRetries, 'attempts');
      setRewardError(lastError?.message || 'Failed to generate reward after multiple attempts');
      setIsLoadingReward(false);
      if (statusPollInterval) clearInterval(statusPollInterval);
    }

    fetchReward();
    
    // Cleanup
    return () => {
      if (statusPollInterval) clearInterval(statusPollInterval);
    };
  }, [roundId]);

  // Set mounted state (for portal)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinueMatching = () => {
    resetGame();
    router.push('/game/selection');
  };

  const handleMainMenu = () => {
    resetGame();
    router.push('/main-menu');
  };

  const handlePlayAudio = () => {
    if (!reward?.rewardVoiceUrl) return;
    
    const audio = new Audio(reward.rewardVoiceUrl);
    setIsPlayingAudio(true);
    
    audio.play().catch(err => {
      console.error('Failed to play audio:', err);
      setIsPlayingAudio(false);
    });
    
    audio.onended = () => {
      setIsPlayingAudio(false);
    };
  };

  return (
    <>
      {/* Confetti Animation - Rendered via Portal to document.body */}
      {isMounted && showConfetti && createPortal(
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <Confetti
            width={width}
            height={height}
            numberOfPieces={200}
            recycle={false}
            colors={['#FF69B4', '#FFB6C1', '#FF1493', '#C71585', '#FFE4E1']}
            gravity={0.3}
          />
        </div>,
        document.body
      )}
      
      <div className="relative bg-black/80 backdrop-blur-sm flex items-center justify-center min-h-[700px] p-4">
        <div className="bg-neutral-900 border-2 border-primary/50 rounded-3xl p-8 w-full text-center space-y-4 animate-in fade-in zoom-in duration-300 my-4">
        {/* Victory Icon */}
        <div className="text-6xl mb-2">🎉</div>
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-primary">You Won!</h2>
        
        {/* Success Message */}
        <p className="text-white/70 text-sm">
          Congratulations! You successfully charmed her.
        </p>
        
        {/* Girl Image with Gradient Border */}
        <div className="py-4">
          <div className="relative inline-block">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-accent rounded-xl blur-sm opacity-75" />
            
            {/* Reward image or loading placeholder - maintains aspect ratio */}
            <div className="relative mx-auto" style={{ maxWidth: '280px', maxHeight: '400px' }}>
              {isLoadingReward ? (
                <div className="w-48 h-48 bg-neutral-800 rounded-xl border-2 border-primary/30 flex flex-col items-center justify-center gap-2 mx-auto">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  <p className="text-xs text-white/40">{loadingMessage}</p>
                </div>
              ) : imageError || !reward?.rewardImageUrl ? (
                <div className="w-48 h-48 bg-neutral-800 rounded-xl border-2 border-primary/30 flex items-center justify-center overflow-hidden mx-auto">
                  <img 
                    src={girl?.imageUrl} 
                    alt={girl?.name || "Girl"} 
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
              ) : (
                <img 
                  src={reward.rewardImageUrl} 
                  alt={`${girl?.name || "Girl"} - Reward`} 
                  className="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-primary/30 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxWidth: '280px' }}
                  onClick={() => setShowFullImage(true)}
                  onError={(e) => {
                    console.error('Failed to load reward image:', reward.rewardImageUrl);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    console.log('✅ Reward image loaded successfully');
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Reward Text - Dynamic from API */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 min-h-[4rem] flex flex-col items-center justify-center gap-2">
          {isLoadingReward ? (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              {loadingMessage}
            </div>
          ) : rewardError ? (
            <div className="text-center">
              <p className="text-sm text-red-400/80 italic mb-1">
                Unable to load reward text
              </p>
              <p className="text-xs text-white/40">
                Error: {rewardError}
              </p>
            </div>
          ) : reward ? (
            <>
              <p className="text-sm text-white/80 italic text-center leading-relaxed">
                {reward.rewardText.startsWith('"') ? reward.rewardText : `"${reward.rewardText}"`}
              </p>
              {reward.rewardVoiceUrl && (
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className="mt-2 px-4 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isPlayingAudio ? (
                    <>
                      <span className="text-base">🔊</span>
                      Playing...
                    </>
                  ) : (
                    <>
                      <span className="text-base">🎵</span>
                      Play Voice
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-white/60 italic">
              Reward not available
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleContinueMatching}
            className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Continue Matching
          </button>
          <button
            onClick={handleMainMenu}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Main Menu
          </button>
        </div>
        
        {/* Full-size Image Modal */}
        {showFullImage && reward?.rewardImageUrl && (
          <div 
            className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 p-4 cursor-pointer"
            onClick={() => setShowFullImage(false)}
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={reward.rewardImageUrl} 
                alt={`${girl?.name || "Girl"} - Full Size`}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullImage(false);
                }}
              />
              <div className="absolute top-4 right-4 text-white/60 text-sm bg-black/50 px-3 py-1 rounded-full">
                Click to close
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

