'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { calculateXpInfo, formatXp } from '@/lib/game/xp-system';
import { Sparkles } from 'lucide-react';

export interface XpDisplayProps {
  level: number;
  totalXp: number | undefined;
}

export function XpDisplay({ level, totalXp }: XpDisplayProps) {
  const [xpInfo, setXpInfo] = useState(() => calculateXpInfo(totalXp ?? 0));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setXpInfo(calculateXpInfo(totalXp ?? 0));
  }, [totalXp]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Level Badge */}
      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#f53049] to-[#f22a5a] px-4 py-2 shadow-lg">
        <Sparkles className="size-4 text-white" />
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">
            Level
          </span>
          <span className="text-lg font-bold leading-none text-white">
            {level}
          </span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="flex min-w-[200px] flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-white/70">
            {formatXp(xpInfo.totalXp)} XP
          </span>
          <span className="text-white/50">
            {level >= 99 ? 'MAX' : `${formatXp(xpInfo.xpToNextLevel)} to next`}
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#f53049] to-[#f22a5a] transition-all duration-500 ease-out"
            style={{ width: `${xpInfo.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

