'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GirlCard } from './GirlCard';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import type { Girl } from '@/types/game';
import { toast } from 'sonner';

interface GirlSelectionProps {
  girls: Girl[];
}

export function GirlSelection({ girls }: GirlSelectionProps) {
  const [selectedGirl, setSelectedGirl] = useState<Girl | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleSelect = (girl: Girl) => {
    if (!isStarting) {
      setSelectedGirl(girl);
    }
  };

  const handleStartChat = async () => {
    if (!selectedGirl) return;

    setIsStarting(true);

    try {
      const response = await fetch('/api/game/start-round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          girlId: selectedGirl.id,
          girlData: {
            name: selectedGirl.name,
            imageUrl: selectedGirl.imageUrl,
            attributes: selectedGirl.attributes,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start round');
      }

      const data = await response.json();
      
      // Navigate to chat page with round ID
      router.push(`/game/chat/${data.roundId}`);
    } catch (error) {
      console.error('Error starting round:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start chat. Please try again.'
      );
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-[#e15f6e] md:text-4xl">
          Choose Your Match
        </h1>
        <p className="text-lg text-white/70">
          Select a profile to start your conversation practice
        </p>
      </div>

      {/* Girl Cards Grid */}
      <div
        className={cn(
          'grid gap-6 transition-opacity duration-300',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          isStarting && 'pointer-events-none opacity-50'
        )}
      >
        {girls.map((girl) => (
          <GirlCard
            key={girl.id}
            girl={girl}
            isSelected={selectedGirl?.id === girl.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Start Chat Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleStartChat}
          disabled={!selectedGirl || isStarting}
          size="lg"
          className={cn(
            'h-14 min-w-[240px] text-lg font-semibold transition-all duration-300',
            'bg-gradient-to-r from-[#f53049] to-[#f22a5a]',
            'hover:from-[#f53049]/90 hover:to-[#f22a5a]/90',
            'disabled:from-[#f53049]/30 disabled:to-[#f22a5a]/30',
            'shadow-lg hover:shadow-xl hover:shadow-[#e15f6e]/30',
            'disabled:cursor-not-allowed disabled:shadow-none'
          )}
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Starting Chat...
            </>
          ) : selectedGirl ? (
            <>
              <Sparkles className="mr-2 size-5" />
              Start Chat with {selectedGirl.name}
            </>
          ) : (
            'Select a Profile to Continue'
          )}
        </Button>
      </div>

      {/* Hint Text */}
      {!selectedGirl && (
        <p className="text-center text-sm text-white/40">
          Click on a profile card above to make your selection
        </p>
      )}
    </div>
  );
}

// Import cn helper
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}


