import Image from 'next/image';
import { ComboIndicator } from './ComboIndicator';

interface ChatHeaderProps {
  girlName: string;
  girlImageUrl: string;
}

export function ChatHeader({ girlName, girlImageUrl }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 border-b border-white/10 bg-neutral-900/50">
      {/* Left side: Girl profile */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
          <Image
            src={girlImageUrl}
            alt={girlName}
            fill
            className="object-cover"
          />
        </div>
        <h2 className="text-lg font-semibold text-primary">{girlName}</h2>
      </div>
      
      {/* Right side: Combo indicator */}
      <ComboIndicator />
    </div>
  );
}

