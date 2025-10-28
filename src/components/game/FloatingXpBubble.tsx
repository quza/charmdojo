'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export interface FloatingXpBubbleProps {
  xp: number;
  onComplete: () => void;
}

export function FloatingXpBubble({ xp, onComplete }: FloatingXpBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Call onComplete after fade out completes
      setTimeout(onComplete, 300);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transition-all duration-1500 ${
        isVisible
          ? 'translate-y-[-100px] opacity-100'
          : 'translate-y-[-150px] opacity-0'
      }`}
      style={{
        animation: 'float-up 1.5s ease-out forwards',
      }}
    >
      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 shadow-2xl">
        <Sparkles className="size-5 text-white" />
        <span className="text-xl font-bold text-white">+{xp} XP</span>
      </div>
    </div>
  );
}

// Add this to your global CSS if not already present
// @keyframes float-up {
//   0% {
//     transform: translate(-50%, -50%) translateY(0);
//     opacity: 0;
//   }
//   20% {
//     opacity: 1;
//   }
//   100% {
//     transform: translate(-50%, -50%) translateY(-100px);
//     opacity: 0;
//   }
// }

