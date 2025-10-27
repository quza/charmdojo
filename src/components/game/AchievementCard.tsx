'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AchievementCardProps {
  title: string;
  description: string;
  iconUrl: string;
  unlocked: boolean;
  className?: string;
}

export function AchievementCard({
  title,
  description,
  iconUrl,
  unlocked,
  className,
}: AchievementCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              'relative cursor-pointer overflow-hidden border-0 transition-all duration-300',
              'bg-gradient-to-br from-[#04060c] to-[#0a0d1a]',
              'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
              'before:bg-gradient-to-r before:from-[#f53049]/30 before:to-[#f22a5a]/30',
              'before:content-[""] before:-z-10',
              'after:absolute after:inset-[1px] after:rounded-xl',
              'after:bg-gradient-to-br after:from-[#04060c] after:to-[#0a0d1a]',
              'after:content-[""] after:-z-10',
              unlocked
                ? 'hover:scale-105 hover:shadow-lg hover:shadow-[#f53049]/20'
                : 'opacity-40 grayscale',
              className
            )}
          >
            <CardContent className="relative z-10 flex flex-col items-center justify-center p-6">
              {/* Icon Container */}
              <div className="relative mb-3 size-20">
                <Image
                  src={iconUrl}
                  alt={title}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-achievement.png';
                  }}
                />
                {/* Lock overlay for locked achievements */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm">
                    <Lock className="size-8 text-white/70" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h3
                className={cn(
                  'text-center text-sm font-semibold',
                  unlocked ? 'text-[#e15f6e]' : 'text-white/50'
                )}
              >
                {title}
              </h3>

              {/* Unlocked Badge */}
              {unlocked && (
                <div className="mt-2 rounded-full bg-[#e15f6e]/20 px-2 py-0.5 text-xs text-[#e15f6e]">
                  Unlocked
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs border-[#e15f6e]/30 bg-gradient-to-br from-[#04060c] to-[#0a0d1a] text-white"
        >
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

