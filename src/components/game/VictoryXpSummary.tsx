'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Zap, Trophy } from 'lucide-react';
import { formatXp } from '@/lib/game/xp-system';
import type { RoundXpSummary } from '@/types/xp';

export interface VictoryXpSummaryProps {
  roundId: string;
}

export function VictoryXpSummary({ roundId }: VictoryXpSummaryProps) {
  const [summary, setSummary] = useState<RoundXpSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch(`/api/game/round-xp-summary?roundId=${roundId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch XP summary');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching XP summary:', err);
        setError('Failed to load XP summary');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [roundId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e15f6e] border-t-transparent" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
        {error || 'Unable to load XP summary'}
      </div>
    );
  }

  const leveledUp = summary.levelAfter > summary.levelBefore;

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="flex items-center gap-2 text-xl font-bold text-white">
        <Trophy className="size-6 text-yellow-500" />
        Experience Gained
      </h3>

      {/* XP Breakdown */}
      <div className="space-y-2 rounded-lg bg-white/5 p-4">
        {/* Message XP */}
        <div className="flex items-center justify-between text-white/80">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-400" />
            <span>Message XP</span>
          </div>
          <span className="font-mono font-semibold">+{formatXp(summary.messageXpSum)}</span>
        </div>

        {/* Win XP */}
        <div className="flex items-center justify-between text-white/80">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-green-400" />
            <span>Win Bonus</span>
          </div>
          <span className="font-mono font-semibold">+{formatXp(summary.winXp)}</span>
        </div>

        {/* Streak Multiplier */}
        {summary.streakMultiplier > 1.0 && (
          <div className="flex items-center justify-between text-white/80">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-yellow-400" />
              <span>Streak Multiplier</span>
            </div>
            <span className="font-mono font-semibold text-yellow-400">
              ×{summary.streakMultiplier.toFixed(1)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="my-2 border-t border-white/10" />

        {/* Total XP */}
        <div className="flex items-center justify-between text-lg font-bold text-white">
          <span>Total XP Gained</span>
          <span className="font-mono text-green-400">
            +{formatXp(summary.totalXpGained)}
          </span>
        </div>
      </div>

      {/* Level Info */}
      <div className="rounded-lg bg-gradient-to-r from-[#f53049]/20 to-[#f22a5a]/20 p-4">
        {leveledUp ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-400">
              <Sparkles className="size-6 animate-pulse" />
              <span>LEVEL UP!</span>
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <div className="text-center text-lg text-white">
              Level {summary.levelBefore} → Level {summary.levelAfter}
            </div>
            <div className="text-center text-sm text-white/60">
              {formatXp(summary.xpAfter)} Total XP
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              Level {summary.levelAfter}
            </div>
            <div className="text-sm text-white/60">
              {formatXp(summary.xpAfter)} Total XP
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

