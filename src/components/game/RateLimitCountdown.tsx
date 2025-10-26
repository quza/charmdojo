'use client';

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface RateLimitCountdownProps {
  initialSeconds: number;
  onComplete?: () => void;
}

export function RateLimitCountdown({ initialSeconds, onComplete }: RateLimitCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, onComplete]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="mb-6 rounded-lg border border-[#e15f6e]/20 bg-[#e15f6e]/5 p-4">
      <div className="flex items-center justify-center gap-2">
        <Timer className="size-5 text-[#e15f6e]" />
        <div className="text-lg font-semibold text-white">
          {minutes > 0 && <span>{minutes}m </span>}
          <span>{seconds}s</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-white/50">
        You can try again in {minutes > 0 && `${minutes} minute${minutes > 1 ? 's' : ''} and `}
        {seconds} second{seconds !== 1 ? 's' : ''}
      </p>
      
      {/* Visual progress bar */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-[#f53049] to-[#f22a5a] transition-all duration-1000 ease-linear"
          style={{
            width: `${(secondsRemaining / initialSeconds) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

