'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/useGame';

export function SuccessMeter() {
  // Read from game store instead of props
  const { currentMeter, lastDelta, showDelta } = useGame();
  const [displayDelta, setDisplayDelta] = useState(false);

  // Show delta animation when it changes
  useEffect(() => {
    if (showDelta && lastDelta !== null && lastDelta !== 0) {
      setDisplayDelta(true);
      const timer = setTimeout(() => setDisplayDelta(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastDelta, showDelta]);

  // Determine color based on value
  const getColor = () => {
    if (currentMeter < 30) return 'bg-red-500';
    if (currentMeter < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (currentMeter < 30) return 'text-red-400';
    if (currentMeter < 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getDeltaColor = () => {
    if (!lastDelta) return '';
    return lastDelta > 0 ? 'text-green-400' : 'text-red-400';
  };

  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, currentMeter));

  return (
    <div className="w-full px-4 py-3 bg-neutral-900/95 border-b border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/70">Success Meter</span>
        <div className="flex items-center gap-2">
          {displayDelta && lastDelta !== null && lastDelta !== 0 && (
            <span 
              className={`text-sm font-bold ${getDeltaColor()} animate-pulse`}
              key={lastDelta} // Force re-render on delta change
            >
              {lastDelta > 0 ? '+' : ''}{lastDelta}%
            </span>
          )}
          <span className={`text-sm font-bold ${getTextColor()}`}>
            {Math.round(clampedValue)}%
          </span>
        </div>
      </div>
      
      {/* Progress bar container */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        {/* Progress bar fill */}
        <div 
          className={`h-full ${getColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>

      {/* Status text */}
      <div className="mt-1 text-center">
        {clampedValue <= 5 && (
          <span className="text-xs text-red-400 font-medium animate-pulse">
            ⚠️ Danger Zone!
          </span>
        )}
        {clampedValue >= 100 && (
          <span className="text-xs text-green-400 font-medium animate-pulse">
            🎉 Victory!
          </span>
        )}
        {clampedValue >= 80 && clampedValue < 100 && (
          <span className="text-xs text-green-400 font-medium">
            🔥 You're doing great!
          </span>
        )}
        {clampedValue >= 60 && clampedValue < 80 && (
          <span className="text-xs text-yellow-400 font-medium">
            😊 Good progress
          </span>
        )}
        {clampedValue >= 30 && clampedValue < 60 && (
          <span className="text-xs text-yellow-400 font-medium">
            💬 Keep going
          </span>
        )}
        {clampedValue > 5 && clampedValue < 30 && (
          <span className="text-xs text-red-400 font-medium">
            😬 Not looking good
          </span>
        )}
      </div>
    </div>
  );
}


