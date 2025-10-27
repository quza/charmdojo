'use client';

import { toast } from 'sonner';
import { Achievement } from '@/types/achievement';

/**
 * Display an achievement unlock toast notification
 */
export function showAchievementToast(achievement: Achievement) {
  toast.success(
    <div className="flex items-center gap-3">
      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-[#e15f6e]/20">
        <span className="text-2xl">🏆</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-white">Achievement Unlocked!</span>
        <span className="text-sm font-medium text-[#e15f6e]">{achievement.title}</span>
        <span className="text-xs text-white/70">{achievement.description}</span>
      </div>
    </div>,
    {
      duration: 5000,
      className: 'bg-gradient-to-br from-[#04060c] to-[#0a0d1a] border-[#e15f6e]/30',
    }
  );
}

/**
 * Display multiple achievement unlock toasts with staggered timing
 */
export function showAchievementToasts(achievements: Achievement[]) {
  achievements.forEach((achievement, index) => {
    setTimeout(() => {
      showAchievementToast(achievement);
    }, index * 500); // Stagger by 500ms each
  });
}

