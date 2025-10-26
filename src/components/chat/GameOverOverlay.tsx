'use client';

import { useRouter } from 'next/navigation';

interface GameOverOverlayProps {
  finalMeter: number;
  failReason?: string;
  roundId: string;
}

export function GameOverOverlay({ finalMeter, failReason, roundId }: GameOverOverlayProps) {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push('/game/selection');
  };

  const handleMainMenu = () => {
    router.push('/main-menu');
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
        {/* Game Over Icon */}
        <div className="text-6xl mb-2">💔</div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-red-400">Game Over</h2>
        
        {/* Final Meter */}
        <div className="py-4">
          <p className="text-white/60 text-sm mb-2">Final Success Meter</p>
          <div className="text-4xl font-bold text-red-400">{Math.round(finalMeter)}%</div>
        </div>
        
        {/* Fail Reason */}
        {failReason && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-300">{failReason}</p>
          </div>
        )}
        
        {/* Message */}
        <p className="text-white/70 text-sm">
          {failReason ? 
            "That didn't go well. Want to try again?" :
            "Better luck next time! Practice makes perfect."
          }
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleTryAgain}
            className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
          <button
            onClick={handleMainMenu}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

