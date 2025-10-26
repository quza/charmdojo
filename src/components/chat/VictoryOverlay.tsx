'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';

interface VictoryOverlayProps {
  roundId: string;
}

export function VictoryOverlay({ roundId }: VictoryOverlayProps) {
  const router = useRouter();
  
  // Read from game store
  const { girl, resetGame } = useGame();

  const handleContinueMatching = () => {
    resetGame();
    router.push('/game/selection');
  };

  const handleMainMenu = () => {
    resetGame();
    router.push('/main-menu');
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border-2 border-primary/50 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
        {/* Victory Icon */}
        <div className="text-6xl mb-2">🎉</div>
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-primary">You Won!</h2>
        
        {/* Success Message */}
        <p className="text-white/70 text-sm">
          Congratulations! You successfully charmed her.
        </p>
        
        {/* Girl Image with Gradient Border */}
        <div className="py-4">
          <div className="relative inline-block">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-accent rounded-xl blur-sm opacity-75" />
            
            {/* Girl image */}
            <div className="relative w-48 h-48 mx-auto">
              <img 
                src={girl?.imageUrl} 
                alt={girl?.name || "Girl"} 
                className="w-full h-full object-cover rounded-xl border-2 border-primary/30"
              />
            </div>
          </div>
        </div>
        
        {/* Reward Placeholder Text */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-white/80 italic">
            "I haven't felt this excited talking to someone in ages... 😏"
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleContinueMatching}
            className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Continue Matching
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

