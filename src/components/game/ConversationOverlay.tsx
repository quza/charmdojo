'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Loader2, Trophy, X, Gift, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { GameRound } from '@/types/game';
import type { Message } from '@/types/chat';

interface ConversationOverlayProps {
  round: GameRound | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RewardData {
  rewardText: string;
  rewardImageUrl: string | null;
  rewardVoiceUrl: string | null;
}

export function ConversationOverlay({ round, isOpen, onClose }: ConversationOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reward display state
  const [showReward, setShowReward] = useState(false);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Fetch messages when overlay opens
  useEffect(() => {
    if (!round || !isOpen) {
      setMessages([]);
      setError(null);
      // Reset reward state when closing
      setShowReward(false);
      setReward(null);
      setRewardError(null);
      setImageError(false);
      setShowFullImage(false);
      return;
    }

    // Reset reward state when switching to a different round
    setShowReward(false);
    setReward(null);
    setRewardError(null);
    setImageError(false);
    setShowFullImage(false);

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/chat/messages/${round.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        
        // Transform messages to match Message interface
        const transformedMessages: Message[] = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || msg.created_at,
        }));

        setMessages(transformedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [round, isOpen]);

  // Fetch reward data when "See Reward" is clicked
  const handleSeeReward = async () => {
    if (!round) return;
    
    // If reward already loaded, just toggle display
    if (reward) {
      setShowReward(true);
      return;
    }

    setRewardLoading(true);
    setRewardError(null);

    try {
      // Use POST method with JSON body
      const response = await fetch(`/api/reward/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roundId: round.id }),
      });
      
      const data = await response.json();
      
      // Handle existing reward (409 status)
      if (response.status === 409 && data.existingReward) {
        console.log('Reward already exists, using cached version');
        setReward({
          rewardText: data.existingReward.rewardText,
          rewardImageUrl: data.existingReward.rewardImageUrl,
          rewardVoiceUrl: data.existingReward.rewardVoiceUrl,
        });
        setShowReward(true);
        setRewardLoading(false);
        return;
      }

      // Handle successful new generation (200 status)
      if (response.ok) {
        setReward({
          rewardText: data.rewardText,
          rewardImageUrl: data.rewardImageUrl,
          rewardVoiceUrl: data.rewardVoiceUrl,
        });
        setShowReward(true);
        setRewardLoading(false);
        return;
      }

      // Handle other errors
      throw new Error(data.message || 'Failed to fetch reward');
    } catch (err: any) {
      console.error('Error fetching reward:', err);
      setRewardError(err.message || 'Failed to load reward');
      setRewardLoading(false);
    }
  };

  // Audio playback handler (same as VictoryOverlay)
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

  // Go back to messages from reward view
  const handleBackToMessages = () => {
    setShowReward(false);
  };

  if (!round) return null;

  const isWin = round.result === 'win';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        'max-w-2xl h-[85vh] p-0 gap-0 flex flex-col',
        'bg-gradient-to-br from-[#04060c] to-[#0a0d1a]',
        'border border-[#e15f6e]/30'
      )}>
        {/* Header with Girl Profile */}
        <DialogHeader className="shrink-0 p-6 pb-4 border-b border-[#e15f6e]/20">
          <div className="flex items-end gap-4">
            {/* Girl Image */}
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-[#e15f6e]">
              <Image
                src={round.girlImageUrl}
                alt={round.girlName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Girl Info */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-white mb-1 truncate">
                {round.girlName}
              </DialogTitle>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                {/* Result Badge */}
                <span className={cn(
                  'flex items-center gap-1 font-semibold',
                  isWin ? 'text-green-400' : 'text-red-400'
                )}>
                  {isWin ? (
                    <>
                      <Trophy className="size-3.5" />
                      Win
                    </>
                  ) : (
                    <>
                      <X className="size-3.5" />
                      Loss
                    </>
                  )}
                </span>
                
                {/* Message Count */}
                <span className="text-white/60">
                  {round.messageCount} messages
                </span>

                {/* Final Meter (if win) */}
                {isWin && (
                  <span className="text-green-400 font-semibold">
                    {round.finalMeter}% ❤️
                  </span>
                )}
              </div>
            </div>

            {/* Action Button - Show different button based on view */}
            {isWin && !showReward && (
              <button
                onClick={handleSeeReward}
                disabled={rewardLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                  "bg-gradient-to-r from-[#e15f6e] to-[#c44556] hover:opacity-90",
                  "text-white shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {rewardLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Gift className="size-4" />
                    See Reward
                  </>
                )}
              </button>
            )}

            {/* Back to Messages Button */}
            {showReward && (
              <button
                onClick={handleBackToMessages}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                  "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                <ArrowLeft className="size-4" />
                Messages
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Main Content Area - Either Messages or Reward */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden min-h-0",
          // Custom scrollbar styling
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#e15f6e]/50",
          "hover:scrollbar-thumb-[#e15f6e]/70",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-[#e15f6e]/50",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:border-2",
          "[&::-webkit-scrollbar-thumb]:border-transparent",
          "hover:[&::-webkit-scrollbar-thumb]:bg-[#e15f6e]/70"
        )}>
          {showReward ? (
            /* Reward Display - Replaces Messages */
            <div className="flex flex-col items-center justify-center p-8 space-y-6 min-h-full">
              {/* Victory Title */}
              <div className="text-center space-y-2">
                <div className="text-6xl">🎉</div>
                <h3 className="text-2xl font-bold text-green-400">You Won!</h3>
                <p className="text-white/60 text-sm">
                  Here's your reward from {round.girlName}
                </p>
              </div>

              {rewardError ? (
                <div className="text-center text-red-400 py-8">
                  <p className="mb-2">{rewardError}</p>
                  <button
                    onClick={handleSeeReward}
                    className="text-sm text-[#e15f6e] hover:text-[#e15f6e]/80 underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : reward ? (
                <>
                  {/* Reward Image */}
                  <div className="flex justify-center">
                    <div 
                      className="relative cursor-pointer transition-opacity hover:opacity-90" 
                      style={{ width: '280px', height: '384px' }}
                      onClick={() => reward.rewardImageUrl && !imageError && setShowFullImage(true)}
                    >
                      {imageError || !reward.rewardImageUrl ? (
                        <div className="w-full h-full bg-neutral-800 rounded-xl border-2 border-[#e15f6e]/30 flex items-center justify-center">
                          <span className="text-white/40 text-sm">Image unavailable</span>
                        </div>
                      ) : (
                        <Image 
                          src={reward.rewardImageUrl} 
                          alt={`${round.girlName} - Reward`}
                          fill
                          className="object-cover rounded-xl border-2 border-[#e15f6e]/30"
                          onError={() => setImageError(true)}
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Click to expand hint */}
                  {reward.rewardImageUrl && !imageError && (
                    <p className="text-xs text-white/40 text-center -mt-2">
                      Click image to expand
                    </p>
                  )}

                  {/* Reward Text */}
                  <div className="bg-[#e15f6e]/10 border border-[#e15f6e]/20 rounded-lg p-6 max-w-md">
                    <p className="text-base text-white/90 italic text-center leading-relaxed">
                      {reward.rewardText.startsWith('"') ? reward.rewardText : `"${reward.rewardText}"`}
                    </p>
                    
                    {/* Audio Play Button */}
                    {reward.rewardVoiceUrl && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={handlePlayAudio}
                          disabled={isPlayingAudio}
                          className="px-6 py-3 bg-[#e15f6e]/20 hover:bg-[#e15f6e]/30 text-[#e15f6e] text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                        >
                          {isPlayingAudio ? (
                            <>
                              <span className="text-lg">🔊</span>
                              Playing...
                            </>
                          ) : (
                            <>
                              <span className="text-lg">🎵</span>
                              Play Voice
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            /* Messages Display - Original View */
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="size-8 animate-spin text-[#e15f6e]" />
                  <p className="text-white/60">Loading conversation...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-white/60">No messages found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      girlImageUrl={round.girlImageUrl}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Result Summary - Only show when not viewing reward */}
        {!showReward && !loading && !error && (
          <div className={cn(
            'shrink-0 p-4 border-t',
            isWin 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          )}>
            <p className={cn(
              'text-center font-semibold',
              isWin ? 'text-green-400' : 'text-red-400'
            )}>
              {isWin 
                ? `🎉 Victory! You reached ${round.finalMeter}% success` 
                : '💔 Game Over - Better luck next time!'
              }
            </p>
          </div>
        )}

        {/* Full-size Image Modal */}
        {showFullImage && reward?.rewardImageUrl && (
          <div 
            className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 p-4 cursor-pointer rounded-xl"
            onClick={() => setShowFullImage(false)}
          >
            <div className="relative w-full h-full max-w-4xl max-h-full">
              <Image 
                src={reward.rewardImageUrl} 
                alt={`${round.girlName} - Full Size`}
                fill
                className="object-contain"
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
      </DialogContent>
    </Dialog>
  );
}

