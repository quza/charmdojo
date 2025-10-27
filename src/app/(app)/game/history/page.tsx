'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { HistoryGirlCard } from '@/components/game/HistoryGirlCard';
import { ConversationOverlay } from '@/components/game/ConversationOverlay';
import { Loader2, ArrowLeft, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { GameRound, RoundsResponse } from '@/types/game';

export default function GameHistoryPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  // State for wins
  const [winRounds, setWinRounds] = useState<GameRound[]>([]);
  const [winCursor, setWinCursor] = useState<string | null>(null);
  const [winHasMore, setWinHasMore] = useState(true);
  const [winLoading, setWinLoading] = useState(true);
  const [winLoadingMore, setWinLoadingMore] = useState(false);

  // State for losses
  const [loseRounds, setLoseRounds] = useState<GameRound[]>([]);
  const [loseCursor, setLoseCursor] = useState<string | null>(null);
  const [loseHasMore, setLoseHasMore] = useState(true);
  const [loseLoading, setLoseLoading] = useState(true);
  const [loseLoadingMore, setLoseLoadingMore] = useState(false);

  // Overlay state
  const [selectedRound, setSelectedRound] = useState<GameRound | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Intersection observer refs
  const winObserverRef = useRef<HTMLDivElement>(null);
  const loseObserverRef = useRef<HTMLDivElement>(null);

  // Fetch wins
  const fetchWins = useCallback(async (cursor: string | null = null) => {
    if (cursor) {
      setWinLoadingMore(true);
    } else {
      setWinLoading(true);
    }

    try {
      const params = new URLSearchParams({
        result: 'win',
        limit: '12',
      });
      
      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/game/rounds?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wins');
      }

      const data: RoundsResponse = await response.json();

      if (cursor) {
        setWinRounds(prev => [...prev, ...data.rounds]);
      } else {
        setWinRounds(data.rounds);
      }

      setWinCursor(data.pagination.nextCursor);
      setWinHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching wins:', error);
    } finally {
      setWinLoading(false);
      setWinLoadingMore(false);
    }
  }, []);

  // Fetch losses
  const fetchLosses = useCallback(async (cursor: string | null = null) => {
    if (cursor) {
      setLoseLoadingMore(true);
    } else {
      setLoseLoading(true);
    }

    try {
      const params = new URLSearchParams({
        result: 'lose',
        limit: '12',
      });
      
      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/game/rounds?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch losses');
      }

      const data: RoundsResponse = await response.json();

      if (cursor) {
        setLoseRounds(prev => [...prev, ...data.rounds]);
      } else {
        setLoseRounds(data.rounds);
      }

      setLoseCursor(data.pagination.nextCursor);
      setLoseHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching losses:', error);
    } finally {
      setLoseLoading(false);
      setLoseLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchWins();
      fetchLosses();
    }
  }, [user, fetchWins, fetchLosses]);

  // Intersection observer for wins
  useEffect(() => {
    if (!winObserverRef.current || winLoading || winLoadingMore || !winHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && winHasMore && !winLoadingMore) {
          fetchWins(winCursor);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(winObserverRef.current);

    return () => observer.disconnect();
  }, [winCursor, winHasMore, winLoading, winLoadingMore, fetchWins]);

  // Intersection observer for losses
  useEffect(() => {
    if (!loseObserverRef.current || loseLoading || loseLoadingMore || !loseHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loseHasMore && !loseLoadingMore) {
          fetchLosses(loseCursor);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loseObserverRef.current);

    return () => observer.disconnect();
  }, [loseCursor, loseHasMore, loseLoading, loseLoadingMore, fetchLosses]);

  // Handle card click
  const handleCardClick = (round: GameRound) => {
    setSelectedRound(round);
    setOverlayOpen(true);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-[400px] animate-pulse rounded-xl bg-gradient-to-br from-[#04060c] to-[#0a0d1a] border border-[#e15f6e]/20"
        />
      ))}
    </div>
  );

  // Empty state
  const EmptyState = ({ type }: { type: 'win' | 'lose' }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {type === 'win' ? (
        <Trophy className="size-16 text-[#e15f6e]/30 mb-4" />
      ) : (
        <X className="size-16 text-[#e15f6e]/30 mb-4" />
      )}
      <h3 className="text-xl font-semibold text-white/60 mb-2">
        {type === 'win' ? 'No wins yet' : 'No losses yet'}
      </h3>
      <p className="text-white/40">
        {type === 'win' 
          ? 'Start matching to win your first conversation!' 
          : "You haven't lost any conversations yet!"}
      </p>
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04060c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e15f6e] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-[#04060c] px-4 py-8">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-7xl">
        <Button
          onClick={() => router.push('/main-menu')}
          variant="outline"
          size="default"
          className="mb-6 border-[#e15f6e]/30 text-[#e15f6e] hover:bg-[#e15f6e]/10"
        >
          <ArrowLeft className="size-4" />
          Back to Menu
        </Button>

        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-[#e15f6e] md:text-5xl">
            Game History
          </h1>
          <p className="text-lg text-white/70">
            Review your past conversations and track your progress
          </p>
        </div>
      </div>

      {/* Split Layout */}
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Wins Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Trophy className="size-6 text-green-400" />
              <h2 className="text-2xl font-bold text-green-400">
                Simulations Won
              </h2>
              <span className="text-lg text-white/60">({winRounds.length})</span>
            </div>

            {winLoading ? (
              <LoadingSkeleton />
            ) : winRounds.length === 0 ? (
              <EmptyState type="win" />
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  {winRounds.map((round) => (
                    <HistoryGirlCard
                      key={round.id}
                      round={round}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>

                {/* Loading more indicator */}
                {winLoadingMore && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="size-6 animate-spin text-[#e15f6e]" />
                  </div>
                )}

                {/* Sentinel for infinite scroll */}
                {winHasMore && <div ref={winObserverRef} className="h-4" />}
              </>
            )}
          </div>

          {/* Separator for mobile */}
          <Separator className="lg:hidden bg-[#e15f6e]/20" />

          {/* Losses Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <X className="size-6 text-red-400" />
              <h2 className="text-2xl font-bold text-red-400">
                Simulations Lost
              </h2>
              <span className="text-lg text-white/60">({loseRounds.length})</span>
            </div>

            {loseLoading ? (
              <LoadingSkeleton />
            ) : loseRounds.length === 0 ? (
              <EmptyState type="lose" />
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  {loseRounds.map((round) => (
                    <HistoryGirlCard
                      key={round.id}
                      round={round}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>

                {/* Loading more indicator */}
                {loseLoadingMore && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="size-6 animate-spin text-[#e15f6e]" />
                  </div>
                )}

                {/* Sentinel for infinite scroll */}
                {loseHasMore && <div ref={loseObserverRef} className="h-4" />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Overlay */}
      <ConversationOverlay
        round={selectedRound}
        isOpen={overlayOpen}
        onClose={() => {
          setOverlayOpen(false);
          setSelectedRound(null);
        }}
      />
    </main>
  );
}


