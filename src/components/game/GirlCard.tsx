'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { Girl } from '@/types/game';

interface GirlCardProps {
  girl: Girl;
  isSelected: boolean;
  onSelect: (girl: Girl) => void;
}

export function GirlCard({ girl, isSelected, onSelect }: GirlCardProps) {
  // Generate random age between 19 and 28
  const age = Math.floor(Math.random() * 10) + 19;

  return (
    <Card
      onClick={() => onSelect(girl)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${girl.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(girl);
        }
      }}
      className={cn(
        'group relative cursor-pointer overflow-hidden border-0 transition-all duration-300',
        'bg-gradient-to-br from-[#04060c] to-[#0a0d1a]',
        'hover:scale-[1.02] hover:shadow-xl hover:shadow-[#e15f6e]/20',
        // Default border
        'before:absolute before:inset-0 before:rounded-xl before:p-[1px]',
        'before:bg-gradient-to-r before:from-[#f53049]/30 before:to-[#f22a5a]/30',
        'before:content-[""] before:-z-10 before:transition-opacity before:duration-300',
        // Selected border (thicker, brighter)
        isSelected && [
          'before:p-[2px]',
          'before:from-[#e15f6e] before:to-[#f53049]',
          'shadow-lg shadow-[#e15f6e]/40',
        ],
        // Background layer
        'after:absolute after:inset-[1px] after:rounded-xl',
        'after:bg-gradient-to-br after:from-[#04060c] after:to-[#0a0d1a]',
        'after:content-[""] after:-z-10',
        isSelected && 'after:inset-[2px]'
      )}
    >
      {/* Image Container */}
      <div className="relative z-10 aspect-[3/4] w-full overflow-hidden rounded-t-xl">
        <Image
          src={girl.imageUrl}
          alt={`${girl.name}'s profile`}
          fill
          className={cn(
            'object-cover transition-all duration-300',
            'group-hover:brightness-110',
            isSelected && 'brightness-105'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
        />
        
        {/* Selected Indicator Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#e15f6e]/30 to-transparent" />
        )}

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute right-3 top-3 rounded-full bg-[#e15f6e] px-3 py-1 text-xs font-semibold text-white shadow-lg">
            ✓ Selected
          </div>
        )}
      </div>

      {/* Name Section */}
      <div className="relative z-10 p-4 text-left">
        {/* Name with active dot and age */}
        <div className="flex items-center gap-2">
          {/* Active indicator dot */}
          <div 
            className="size-2.5 shrink-0 rounded-full bg-green-400"
            style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }}
          />
          
          {/* Name and age */}
          <h3 className="flex items-baseline gap-1">
            <span
              className={cn(
                'text-2xl font-bold transition-colors duration-300',
                isSelected ? 'text-[#e15f6e]' : 'text-white group-hover:text-[#e15f6e]'
              )}
            >
              {girl.name}
            </span>
            <span className="text-xl font-normal text-white/50">
              , {age}
            </span>
          </h3>
        </div>
        
        {/* Bio placeholder */}
        <p className="mt-1 text-sm text-white/50">
          Placeholder bio
        </p>
      </div>

      {/* Focus ring for accessibility */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-xl ring-2 ring-[#e15f6e] ring-offset-2 ring-offset-[#04060c] opacity-0 transition-opacity',
          'focus-visible:opacity-100'
        )}
      />
    </Card>
  );
}


