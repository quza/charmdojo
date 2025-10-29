export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  totalWins: number;
  successRatio: number;
  currentStreak: number;
  totalAchievements: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

