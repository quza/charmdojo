'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { GirlSelection } from '@/components/game/GirlSelection';
import { RateLimitCountdown } from '@/components/game/RateLimitCountdown';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import type { Girl, GenerateGirlsResponse } from '@/types/game';

export default function SelectionPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false); // Prevent multiple fetches

  const fetchGirls = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryAfter(null);
    setHasFetched(true); // Mark as fetched to prevent re-fetching

    try {
      const response = await fetch('/api/game/generate-girls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to continue');
        } else if (response.status === 429) {
          const errorData = await response.json();
          setRetryAfter(errorData.secondsUntilReset || null);
          throw new Error(errorData.message || 'Too many requests. Please wait a moment and try again.');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate profiles');
        }
      }

      const data: GenerateGirlsResponse = await response.json();

      if (!data.success || data.girls.length === 0) {
        throw new Error('No profiles could be generated. Please try again.');
      }

      // Log metadata in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Generation metadata:', data.metadata);
      }

      setGirls(data.girls);
      setGenerationTime(data.metadata.totalTime);
    } catch (err) {
      console.error('Error generating girls:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - function doesn't depend on any external values

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) return;

    // Redirect to home if not authenticated
    if (!user) {
      router.push('/');
      return;
    }

    // Only fetch once - prevent infinite loops
    if (hasFetched) return;

    // Fetch girls on mount
    fetchGirls();
  }, [user, authLoading, router, hasFetched, fetchGirls]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04060c]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e15f6e] border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Loading state - generating profiles
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#04060c] px-4">
        <div className="text-center">
          {/* Animated spinner */}
          <div className="relative mx-auto mb-8 size-20">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#e15f6e] border-t-transparent" />
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-[#f53049]/50 border-t-transparent animation-delay-150" />
          </div>

          {/* Loading text */}
          <h2 className="mb-2 text-2xl font-bold text-[#e15f6e]">
            Generating Your Matches...
          </h2>
          <p className="text-white/70">
            This may take up to 30 seconds. Please wait.
          </p>

          {/* Progress dots animation */}
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-2 animate-bounce rounded-full bg-[#e15f6e]"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    const isRateLimited = retryAfter !== null;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#04060c] px-4">
        <div className="max-w-md text-center">
          {/* Error icon */}
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-[#ef4444]/10">
            <AlertCircle className="size-8 text-[#ef4444]" />
          </div>

          {/* Error message */}
          <h2 className="mb-2 text-2xl font-bold text-white">
            {isRateLimited ? 'Slow Down There!' : 'Oops! Something Went Wrong'}
          </h2>
          <p className="mb-6 text-white/70">{error}</p>

          {/* Rate limit countdown */}
          {isRateLimited && retryAfter && (
            <RateLimitCountdown 
              initialSeconds={retryAfter} 
              onComplete={() => {
                setRetryAfter(null);
                setError(null);
              }} 
            />
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={fetchGirls}
              size="lg"
              disabled={isRateLimited}
              className="bg-gradient-to-r from-[#f53049] to-[#f22a5a] hover:from-[#f53049]/90 hover:to-[#f22a5a]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw className="mr-2 size-4" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/main-menu')}
              variant="outline"
              size="lg"
              className="border-[#e15f6e]/30 text-[#e15f6e] hover:bg-[#e15f6e]/10"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Success state - show girl selection
  return (
    <main className="min-h-screen bg-[#04060c] px-4 py-12">
      <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
        <GirlSelection girls={girls} />

        {/* Generation info (dev mode) */}
        {process.env.NODE_ENV === 'development' && generationTime && (
          <div className="mt-8 text-center text-xs text-white/30">
            Generated in {generationTime.toFixed(2)}s
          </div>
        )}
      </div>
    </main>
  );
}


