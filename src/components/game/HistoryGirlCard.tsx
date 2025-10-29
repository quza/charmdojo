'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { GameRound } from '@/types/game';
import { Trophy, X, MessageCircle, Calendar, Pin, PinOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface HistoryGirlCardProps {
  round: GameRound;
  onClick: (round: GameRound) => void;
  onPinChange?: (roundId: string, isPinned: boolean) => void;
  showPinButton?: boolean;
}

export function HistoryGirlCard({ 
  round, 
  onClick, 
  onPinChange,
  showPinButton = false 
}: HistoryGirlCardProps) {
  const isWin = round.result === 'win';
  const [isPinning, setIsPinning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date
  const completedDate = new Date(round.completedAt);
  const formattedDate = completedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handlePinClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsPinning(true);

    try {
      const method = round.isPinned ? 'DELETE' : 'POST';
      const response = await fetch(`/api/game/rounds/${round.id}/pin`, {
        method,
      });

      if (!response.ok) {
        throw new Error('Failed to update pin status');
      }

      const data = await response.json();
      
      // Call parent callback to update state
      if (onPinChange) {
        onPinChange(round.id, data.pinned);
      }

      toast.success(data.pinned ? 'Girl pinned!' : 'Girl unpinned');
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update pin status');
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <Card
      onClick={() => onClick(round)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`View conversation with ${round.girlName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(round);
        }
      }}
      className={cn(
        'group relative cursor-pointer overflow-hidden border-0 transition-all duration-300',
        'bg-gradient-to-br from-[#04060c] to-[#0a0d1a]',
        'hover:scale-[1.02] hover:shadow-xl hover:shadow-[#e15f6e]/20',
        // Default border
        'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
        'before:bg-gradient-to-r before:from-[#f53049]/30 before:to-[#f22a5a]/30',
        'before:content-[""] before:-z-10 before:transition-opacity before:duration-300',
        // Background layer
        'after:absolute after:inset-[1px] after:rounded-xl',
        'after:bg-gradient-to-br after:from-[#04060c] after:to-[#0a0d1a]',
        'after:content-[""] after:-z-10'
      )}
    >
      {/* Image Container */}
      <div className="relative z-10 aspect-[3/4] w-full overflow-hidden rounded-t-xl">
        <Image
          src={round.girlImageUrl}
          alt={`${round.girlName}'s profile`}
          fill
          className={cn(
            'object-cover transition-all duration-300',
            'group-hover:brightness-110'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Result Badge */}
        <div className={cn(
          'absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg',
          isWin 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        )}>
          {isWin ? (
            <>
              <Trophy className="size-3" />
              Win
            </>
          ) : (
            <>
              <X className="size-3" />
              Loss
            </>
          )}
        </div>

        {/* Success Meter Badge (only for wins) */}
        {isWin && (
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-green-400 backdrop-blur-sm">
            {round.finalMeter}% ❤️
          </div>
        )}

        {/* Pin Button - Appears on hover for wins */}
        {showPinButton && isWin && (
          <div
            className={cn(
              'absolute bottom-3 right-3 transition-opacity duration-200',
              isHovered || round.isPinned ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Button
              onClick={handlePinClick}
              disabled={isPinning}
              size="sm"
              variant="secondary"
              className={cn(
                'rounded-full shadow-lg backdrop-blur-sm transition-all',
                round.isPinned
                  ? 'bg-[#e15f6e] hover:bg-[#e15f6e]/80 text-white'
                  : 'bg-black/60 hover:bg-black/80 text-white'
              )}
            >
              {round.isPinned ? (
                <>
                  <PinOff className="size-3.5 mr-1" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="size-3.5 mr-1" />
                  Pin
                </>
              )}
            </Button>
          </div>
        )}

        {/* Pinned Indicator Badge - Bottom left corner */}
        {round.isPinned && (
          <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-[#e15f6e] px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
            <Pin className="size-3" />
            Pinned
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="relative z-10 p-4 text-left">
        {/* Name */}
        <h3 className="mb-2 text-xl font-bold text-white group-hover:text-[#e15f6e] transition-colors duration-300">
          {round.girlName}
        </h3>
        
        {/* Stats Row */}
        <div className="flex items-center gap-3 text-sm text-white/60">
          {/* Message Count */}
          <div className="flex items-center gap-1">
            <MessageCircle className="size-3.5" />
            <span>{round.messageCount} messages</span>
          </div>
          
          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Focus ring for accessibility */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl ring-2 ring-[#e15f6e] ring-offset-2 ring-offset-[#04060c] opacity-0 transition-opacity',
          'group-focus-visible:opacity-100'
        )}
      />
    </Card>
  );
}


