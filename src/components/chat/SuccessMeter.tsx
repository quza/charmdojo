'use client';

import { useEffect, useState } from 'react';

interface SuccessMeterProps {
  value: number; // 0-100
  delta?: number; // Last change amount
  showDelta?: boolean; // Whether to show delta animation
}

export function SuccessMeter({ value, delta, showDelta = false }: SuccessMeterProps) {
  const [displayDelta, setDisplayDelta] = useState(false);

  // Show delta animation when it changes
  useEffect(() => {
    if (showDelta && delta !== undefined && delta !== 0) {
      setDisplayDelta(true);
      const timer = setTimeout(() => setDisplayDelta(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [delta, showDelta]);

  // Determine color based on value
  const getColor = () => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (value < 30) return 'text-red-400';
    if (value < 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getDeltaColor = () => {
    if (!delta) return '';
    return delta > 0 ? 'text-green-400' : 'text-red-400';
  };

  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full px-4 py-3 bg-neutral-900/95 border-b border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/70">Success Meter</span>
        <div className="flex items-center gap-2">
          {displayDelta && delta !== undefined && delta !== 0 && (
            <span 
              className={`text-sm font-bold ${getDeltaColor()} animate-pulse`}
              key={delta} // Force re-render on delta change
            >
              {delta > 0 ? '+' : ''}{delta}%
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

