'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ActionCard } from '@/components/game/ActionCard';
import { StatsCard } from '@/components/game/StatsCard';
import { useEffect, useState } from 'react';

interface UserStats {
  totalRounds: number;
  wins: number;
  losses: number;
  winRate: number;
}

export default function MainMenuPage() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalRounds: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setFadeIn(true);

    // Fetch user stats (placeholder for now)
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call in Phase 6
        // For now, use placeholder data
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
        setStats({
          totalRounds: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleSignOut = async () => {
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
    .map((n) => n[0])
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
          </div>
        </div>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Start Matching"
            description="Begin a new conversation simulation and practice your skills"
            icon={Sparkles}
            onClick={handleStartMatching}
          />
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
        </div>

        {/* Separator */}
        <Separator className="bg-[#e15f6e]/20" />

        {/* Stats Section */}
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-[#e15f6e]">Your Progress</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {statsLoading ? (
              <>
                {[1, 2, 3].map((i) => (
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

