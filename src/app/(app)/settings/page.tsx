'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // Settings state
  const [displayRewards, setDisplayRewards] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch user's current settings from database
  useEffect(() => {
    async function fetchUserSettings() {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('users')
          .select('display_rewards, show_on_leaderboard')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user settings:', error);
          toast.error('Failed to load settings');
          return;
        }

        if (data) {
          setDisplayRewards(data.display_rewards ?? true);
          setShowOnLeaderboard(data.show_on_leaderboard ?? true);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoadingSettings(false);
      }
    }

    fetchUserSettings();
  }, [user]);

  const handleBack = () => {
    router.push('/main-menu');
  };

  const handleToggleDisplayRewards = async (checked: boolean) => {
    setSavingSettings(true);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ display_rewards: checked }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      setDisplayRewards(checked);
      toast.success(
        checked
          ? 'Rewards will be displayed on victory'
          : 'Rewards will be hidden on victory'
      );
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
      // Revert toggle on error
      setDisplayRewards(!checked);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleShowOnLeaderboard = async (checked: boolean) => {
    setSavingSettings(true);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show_on_leaderboard: checked }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      setShowOnLeaderboard(checked);
      toast.success(
        checked
          ? 'You will appear on the leaderboard'
          : 'You will be hidden from the leaderboard'
      );
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
      // Revert toggle on error
      setShowOnLeaderboard(!checked);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading || loadingSettings) {
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

  return (
    <main className="min-h-screen bg-[#04060c] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#e15f6e]">Settings</h1>
            <p className="text-sm text-white/70">Manage your preferences</p>
          </div>
        </div>

        {/* Reward Display Settings */}
        <Card className="border-[#e15f6e]/20 bg-gradient-to-br from-[#04060c] to-[#0a0d1a]">
          <CardHeader>
            <CardTitle className="text-[#e15f6e]">Reward Display</CardTitle>
            <CardDescription className="text-white/70">
              Control whether to show rewards when you win a game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#e15f6e]/20 bg-[#04060c]/50 p-4">
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="display-rewards"
                  className="text-base font-medium text-white cursor-pointer"
                >
                  Display Rewards
                </Label>
                <p className="text-sm text-white/60">
                  {displayRewards
                    ? 'Victory rewards (image, voice, text) will be shown'
                    : 'Rewards will be generated but hidden from view'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {savingSettings && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#e15f6e]" />
                )}
                <Switch
                  id="display-rewards"
                  checked={displayRewards}
                  onCheckedChange={handleToggleDisplayRewards}
                  disabled={savingSettings}
                  className="data-[state=checked]:bg-[#e15f6e]"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-sm text-blue-300/80">
                <span className="font-semibold">Note:</span> Even when disabled, rewards are still
                generated and saved. You can re-enable this setting anytime to view your rewards.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Privacy Settings */}
        <Card className="border-[#e15f6e]/20 bg-gradient-to-br from-[#04060c] to-[#0a0d1a]">
          <CardHeader>
            <CardTitle className="text-[#e15f6e]">Leaderboard Privacy</CardTitle>
            <CardDescription className="text-white/70">
              Control your visibility on the global leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#e15f6e]/20 bg-[#04060c]/50 p-4">
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="show-on-leaderboard"
                  className="text-base font-medium text-white cursor-pointer"
                >
                  Appear on the Leaderboard
                </Label>
                <p className="text-sm text-white/60">
                  {showOnLeaderboard
                    ? 'Your stats will be visible on the global leaderboard'
                    : 'You will be hidden from the leaderboard rankings'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {savingSettings && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#e15f6e]" />
                )}
                <Switch
                  id="show-on-leaderboard"
                  checked={showOnLeaderboard}
                  onCheckedChange={handleToggleShowOnLeaderboard}
                  disabled={savingSettings}
                  className="data-[state=checked]:bg-[#e15f6e]"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-sm text-purple-300/80">
                <span className="font-semibold">Privacy:</span> When disabled, your profile and stats will not appear on the leaderboard. You can still view the leaderboard yourself.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Future Settings Section Placeholder */}
        <Card className="border-[#e15f6e]/20 bg-gradient-to-br from-[#04060c] to-[#0a0d1a] opacity-50">
          <CardHeader>
            <CardTitle className="text-[#e15f6e]">More Settings Coming Soon</CardTitle>
            <CardDescription className="text-white/70">
              Additional preferences will be available in future updates
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}

