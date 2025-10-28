'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Settings, LogOut, BookOpen, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ActionCard } from '@/components/game/ActionCard';
import { StatsCard } from '@/components/game/StatsCard';
import { AchievementCard } from '@/components/game/AchievementCard';
import { XpDisplay } from '@/components/game/XpDisplay';
import { showAchievementToasts } from '@/components/game/AchievementToast';
import { useEffect, useState, useCallback } from 'react';
import { Achievement } from '@/types/achievement';
import {
  getCachedStats,
  setCachedStats,
  getCachedAchievements,
  setCachedAchievements,
  checkAndClearRefreshFlag,
  clearAllCache,
  markShouldRefresh,
} from '@/lib/utils/stats-cache';

interface UserStats {
  totalRounds: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalAchievements: number;
  level: number;
  totalXp: number;
  xpToNextLevel: number;
}

export default function MainMenuPage() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalRounds: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalAchievements: 0,
    level: 1,
    totalXp: 0,
    xpToNextLevel: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [rankLoading, setRankLoading] = useState(true);

  // Fetch stats function with caching
  const fetchStats = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    // Try to use cached data if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedStats(user.id);
      if (cached) {
        console.log('Using cached stats');
        setStats(cached);
        setStatsLoading(false);
        return;
      }
    }

    setStatsLoading(true);
    try {
      console.log('Fetching stats from: /api/user/stats');
      
      const response = await fetch('/api/user/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
      
      console.log('Stats response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
      // Cache the fetched data
      setCachedStats(user.id, data);
      console.log('Stats fetched and cached');
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Log more details about the error
      if (error instanceof TypeError) {
        console.error('TypeError details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      // Keep default stats (all zeros) on error
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  // Fetch achievements function with caching
  const fetchAchievements = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    // Try to use cached data if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedAchievements(user.id);
      if (cached) {
        console.log('Using cached achievements');
        setAchievements(cached);
        setAchievementsLoading(false);
        return;
      }
    }

    setAchievementsLoading(true);
    try {
      // Add checkNew parameter to conditionally check for new achievements
      const url = forceRefresh 
        ? '/api/user/achievements?checkNew=true' 
        : '/api/user/achievements?checkNew=false';
      
      console.log('Fetching achievements from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
      
      console.log('Achievements response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Achievements fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch achievements: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAchievements(data.achievements);
      // Cache the fetched data
      setCachedAchievements(user.id, data.achievements);
      console.log('Achievements fetched and cached');
      
      // Show toasts for newly unlocked achievements (only when force refreshing)
      if (forceRefresh && data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        const newlyUnlockedAchievements = data.achievements.filter((a: Achievement) =>
          data.newlyUnlocked.includes(a.key)
        );
        showAchievementToasts(newlyUnlockedAchievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      // Log more details about the error
      if (error instanceof TypeError) {
        console.error('TypeError details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
    } finally {
      setAchievementsLoading(false);
    }
  }, [user]);

  // Fetch user rank function
  const fetchUserRank = useCallback(async () => {
    if (!user) return;

    setRankLoading(true);
    try {
      console.log('Fetching user rank from: /api/user/rank');
      
      const response = await fetch('/api/user/rank', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
      
      console.log('Rank response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Rank fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch rank: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setUserRank(data.rank);
      console.log('User rank fetched:', data.rank);
    } catch (error) {
      console.error('Error fetching user rank:', error);
    } finally {
      setRankLoading(false);
    }
  }, [user]);

  // Effect: Initial load and fade-in animation
  useEffect(() => {
    setFadeIn(true);

    if (user) {
      // Check for refresh query param (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const hasRefreshParam = urlParams.has('refresh');
      
      // Check if we should refresh (e.g., after sign-in or game completion)
      const shouldRefresh = checkAndClearRefreshFlag() || hasRefreshParam;
      
      // Clean up URL if refresh param was present
      if (hasRefreshParam) {
        // Mark for refresh and clean URL
        markShouldRefresh();
        window.history.replaceState({}, '', window.location.pathname);
      }
      
      if (shouldRefresh) {
        console.log('Refresh flag detected - fetching fresh data with achievement checks');
        fetchStats(true);
        fetchAchievements(true);
      } else {
        console.log('No refresh flag - using cached data if available');
        fetchStats(false);
        fetchAchievements(false);
      }
      
      // Always fetch rank fresh (no caching)
      fetchUserRank();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // fetchStats, fetchAchievements, and fetchUserRank are stable (useCallback with proper deps), safe to omit

  // Effect: Refetch stats and achievements ONLY when returning from game (via visibility change)
  // This ensures fresh data after game completion
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Check if the refresh flag was set (e.g., by game completion)
        const shouldRefresh = checkAndClearRefreshFlag();
        
        if (shouldRefresh) {
          console.log('Page visible after game completion - refreshing with achievement checks...');
          fetchStats(true);
          fetchAchievements(true);
        } else {
          console.log('Page visible but no refresh needed - using cached data');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Remove focus handler - no longer needed
    // We only refresh on sign-in and after game completion

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // fetchStats and fetchAchievements are stable (useCallback with proper deps), safe to omit

  const handleSignOut = async () => {
    // Clear cache on sign out
    clearAllCache();
    await signOut();
    router.push('/');
  };

  const handleStartMatching = () => {
    router.push('/game/selection');
  };

  const handleEditProfile = () => {
    router.push('/profile');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleGameHistory = () => {
    router.push('/game/history');
  };

  const handleLeaderboard = () => {
    router.push('/leaderboard');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04060c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e15f6e] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <main
      className={`min-h-screen bg-[#04060c] px-4 py-8 transition-opacity duration-700 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Header */}
      <div className="mx-auto mb-12 flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 border-2 border-[#e15f6e]">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={userName} />
            <AvatarFallback className="bg-gradient-to-r from-[#f53049] to-[#f22a5a] text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-white">Welcome back,</h2>
            <p className="text-xl font-bold text-[#e15f6e]">{userName}</p>
            {rankLoading ? (
              <p className="text-sm text-white/50">Loading rank...</p>
            ) : userRank !== null ? (
              <p className="text-sm text-white/70">Rank: #{userRank}</p>
            ) : (
              <p className="text-sm text-white/70">Unranked</p>
            )}
          </div>
        </div>

        {/* XP Display */}
        {!statsLoading && (
          <XpDisplay level={stats.level} totalXp={stats.totalXp} />
        )}
        
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="default"
          className="border-[#e15f6e]/30 text-[#e15f6e] hover:bg-[#e15f6e]/10"
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Hero Text */}
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-[#e15f6e] md:text-5xl">Ready to Practice?</h1>
          <p className="text-lg text-white/70">Choose an option below to get started</p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <ActionCard
            title="Edit Profile"
            description="Update your profile information and preferences"
            icon={User}
            onClick={handleEditProfile}
          />
          <ActionCard
            title="Settings"
            description="Manage your account settings and preferences"
            icon={Settings}
            onClick={handleSettings}
          />
          <ActionCard
            title="Start Matching"
            description="Begin a new conversation simulation and practice your skills"
            icon={Sparkles}
            onClick={handleStartMatching}
            className="hover:scale-110 hover:shadow-2xl hover:shadow-[#f53049]/40 bg-gradient-to-br from-[#f53049]/20 to-[#f22a5a]/20 before:from-[#f53049] before:to-[#f22a5a] before:opacity-100 before:transition-all before:duration-300 hover:before:from-white hover:before:to-white after:from-[#f53049]/10 after:to-[#f22a5a]/10 after:transition-all after:duration-300 hover:after:from-[#f22b56] hover:after:to-[#f22b56] [&_.rounded-full]:ring-2 [&_.rounded-full]:ring-transparent [&_.rounded-full]:transition-all [&_.rounded-full]:duration-0 [&_.rounded-full]:delay-300 [&_.rounded-full]:group-hover:delay-0 [&_.rounded-full]:group-hover:ring-white [&_[data-slot=card-title]]:transition-all [&_[data-slot=card-title]]:duration-0 [&_[data-slot=card-title]]:delay-300 [&_[data-slot=card-title]]:group-hover:delay-0 [&_[data-slot=card-title]]:group-hover:!text-white"
          />
          <ActionCard
            title="Game History"
            description="Review your past conversations and see your progress"
            icon={BookOpen}
            onClick={handleGameHistory}
          />
          <ActionCard
            title="Leaderboard"
            description="See how you rank against other players globally"
            icon={Trophy}
            onClick={handleLeaderboard}
          />
        </div>

        {/* Separator */}
        <Separator className="bg-[#e15f6e]/20" />

        {/* Stats Section */}
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-[#e15f6e]">Your Progress</h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {statsLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl bg-gradient-to-br from-[#04060c] to-[#0a0d1a]"
                  />
                ))}
              </>
            ) : (
              <>
                <StatsCard label="Simulations Won" value={stats.wins} />
                <StatsCard label="Simulations Failed" value={stats.losses} />
                <StatsCard
                  label="Success Ratio"
                  value={stats.winRate.toFixed(1)}
                  suffix="%"
                />
                <StatsCard label="Current Winstreak" value={stats.currentStreak} />
                <StatsCard label="Total Achievements" value={stats.totalAchievements} />
              </>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-[#e15f6e]">Your Achievements</h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {achievementsLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse rounded-xl bg-gradient-to-br from-[#04060c] to-[#0a0d1a]"
                  />
                ))}
              </>
            ) : (
              <>
                {achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    iconUrl={achievement.iconUrl}
                    unlocked={achievement.unlocked}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-white/50">
          <p>Keep practicing to improve your conversation skills!</p>
        </div>
      </div>
    </main>
  );
}

