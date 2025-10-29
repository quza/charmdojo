'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useCallback } from 'react';
import { LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard';
import { checkAndClearLeaderboardRefreshFlag } from '@/lib/utils/stats-cache';

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchLeaderboard = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leaderboard', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data: LeaderboardResponse = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Effect: Refetch leaderboard when returning from game (via visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Check if the refresh flag was set (e.g., by game completion)
        const shouldRefresh = checkAndClearLeaderboardRefreshFlag();
        
        if (shouldRefresh) {
          console.log('Page visible after game completion - refreshing leaderboard...');
          fetchLeaderboard();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchLeaderboard]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchLeaderboard();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="size-6 text-yellow-400" />;
      case 2:
        return <Medal className="size-6 text-gray-400" />;
      case 3:
        return <Medal className="size-6 text-amber-600" />;
      default:
        return <span className="text-lg font-semibold text-white/60">#{rank}</span>;
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#04060c] px-4 py-8">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <Button
            onClick={() => router.push('/main-menu')}
            variant="outline"
            size="default"
            className="border-[#e15f6e]/30 text-[#e15f6e] hover:bg-[#e15f6e]/10"
          >
            <ArrowLeft className="size-4" />
            Back to Menu
          </Button>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="default"
            className="border-[#e15f6e]/30 text-[#e15f6e] hover:bg-[#e15f6e]/10"
            disabled={loading || isRefreshing}
          >
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-[#f53049] to-[#f22a5a] p-4">
              <Trophy className="size-12 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-[#e15f6e] md:text-5xl">
            Global Leaderboard
          </h1>
          <p className="text-lg text-white/70">
            Top players ranked by Total XP
          </p>
          {leaderboardData?.currentUserRank && (
            <p className="mt-2 text-sm text-[#e15f6e]">
              Your Rank: #{leaderboardData.currentUserRank}
            </p>
          )}
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="mx-auto max-w-7xl">
        {loading ? (
          <Card className="border-[#e15f6e]/20 bg-[#0a0d1a]">
            <CardContent className="py-12">
              <p className="text-center text-white/70">Loading leaderboard...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-[#e15f6e]/20 bg-[#0a0d1a]">
            <CardContent className="py-12">
              <p className="text-center text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : leaderboardData?.entries.length === 0 ? (
          <Card className="border-[#e15f6e]/20 bg-[#0a0d1a]">
            <CardContent className="py-12">
              <p className="text-center text-white/70">No players on the leaderboard yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Card className="border-[#e15f6e]/20 bg-[#0a0d1a]">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#e15f6e]">Top Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e15f6e]/20">
                          <th className="pb-4 text-left text-sm font-semibold text-white/80">Rank</th>
                          <th className="pb-4 text-left text-sm font-semibold text-white/80">Player</th>
                          <th className="pb-4 text-center text-sm font-semibold text-white/80">Level</th>
                          <th className="pb-4 text-center text-sm font-semibold text-white/80">Total XP</th>
                          <th className="pb-4 text-center text-sm font-semibold text-white/80">Simulations Won</th>
                          <th className="pb-4 text-center text-sm font-semibold text-white/80">Success Ratio</th>
                          <th className="pb-4 text-center text-sm font-semibold text-white/80">Current Winstreak</th>
                          <th className="pb-4 text-center text-sm font-semibold text-white/80">Total Achievements</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData?.entries.map((entry) => (
                          <tr
                            key={entry.userId}
                            className={`border-b border-[#e15f6e]/10 transition-colors hover:bg-[#e15f6e]/5 ${
                              entry.userId === user.id ? 'bg-[#e15f6e]/10' : ''
                            }`}
                          >
                            <td className="py-4">
                              <div className="flex items-center justify-start">
                                {getRankIcon(entry.rank)}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                  <AvatarImage src={entry.avatarUrl || undefined} />
                                  <AvatarFallback className="bg-[#e15f6e]/20 text-[#e15f6e]">
                                    {(entry.name || 'Anonymous Player').charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-white">
                                    {entry.name || 'Anonymous Player'}
                                  </p>
                                  {entry.userId === user.id && (
                                    <p className="text-xs text-[#e15f6e]">(You)</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className="font-semibold text-white">{entry.level}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-white">{entry.totalXp.toLocaleString()}</span>
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Trophy className="size-4 text-yellow-400" />
                                <span className="font-semibold text-white">{entry.totalWins}</span>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-white">{entry.successRatio.toFixed(1)}%</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className="font-medium text-[#e15f6e]">
                                {entry.currentStreak > 0 ? `🔥 ${entry.currentStreak}` : '0'}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Award className="size-4 text-purple-400" />
                                <span className="text-white">{entry.totalAchievements}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
              {leaderboardData?.entries.map((entry) => (
                <Card
                  key={entry.userId}
                  className={`border-[#e15f6e]/20 bg-[#0a0d1a] ${
                    entry.userId === user.id ? 'ring-2 ring-[#e15f6e]/50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>{getRankIcon(entry.rank)}</div>
                        <Avatar className="size-12">
                          <AvatarImage src={entry.avatarUrl || undefined} />
                          <AvatarFallback className="bg-[#e15f6e]/20 text-[#e15f6e]">
                            {(entry.name || 'Anonymous Player').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">
                            {entry.name || 'Anonymous Player'}
                          </p>
                          {entry.userId === user.id && (
                            <p className="text-xs text-[#e15f6e]">(You)</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-[#04060c] p-3">
                        <p className="mb-1 text-xs text-white/60">Level</p>
                        <p className="text-lg font-semibold text-white">{entry.level}</p>
                      </div>
                      <div className="rounded-lg bg-[#04060c] p-3">
                        <p className="mb-1 text-xs text-white/60">Total XP</p>
                        <p className="text-lg font-semibold text-white">{entry.totalXp.toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg bg-[#04060c] p-3">
                        <p className="mb-1 text-xs text-white/60">Simulations Won</p>
                        <div className="flex items-center gap-1">
                          <Trophy className="size-4 text-yellow-400" />
                          <p className="text-lg font-semibold text-white">{entry.totalWins}</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#04060c] p-3">
                        <p className="mb-1 text-xs text-white/60">Success Ratio</p>
                        <p className="text-lg font-semibold text-white">{entry.successRatio.toFixed(1)}%</p>
                      </div>
                      <div className="rounded-lg bg-[#04060c] p-3">
                        <p className="mb-1 text-xs text-white/60">Current Winstreak</p>
                        <p className="text-lg font-semibold text-[#e15f6e]">
                          {entry.currentStreak > 0 ? `🔥 ${entry.currentStreak}` : '0'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-[#04060c] p-3">
                        <p className="mb-1 text-xs text-white/60">Total Achievements</p>
                        <div className="flex items-center gap-1">
                          <Award className="size-4 text-purple-400" />
                          <p className="text-lg font-semibold text-white">{entry.totalAchievements}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

