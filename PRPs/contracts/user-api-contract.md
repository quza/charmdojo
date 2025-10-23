# User API Contract

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**Base URL:** `/api/user`

---

## Overview

User profile and statistics management endpoints.

---

## Endpoints

### 1. Get User Profile

**Endpoint:** `GET /api/user/profile`  
**Purpose:** Retrieve authenticated user's profile information  
**Authentication:** Required (Bearer token)

#### Request

No body or query parameters required.

#### Response (200 OK)

```typescript
interface UserProfileResponse {
  user: {
    id: string;                // UUID
    email: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string;        // ISO 8601
    updated_at: string;        // ISO 8601
  };
  subscription: {
    status: 'free' | 'premium';
    plan_type: 'monthly' | 'yearly' | null;
    current_period_end: string | null;  // ISO 8601
    cancel_at_period_end: boolean;
  };
}
```

**Example Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "avatar_url": "https://storage.supabase.co/avatars/avatar_123.jpg",
    "created_at": "2025-10-01T10:30:00Z",
    "updated_at": "2025-10-23T10:30:00Z"
  },
  "subscription": {
    "status": "premium",
    "plan_type": "monthly",
    "current_period_end": "2025-11-23T10:30:00Z",
    "cancel_at_period_end": false
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "error": "unauthorized",
  "message": "Authentication required",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 2. Update User Profile

**Endpoint:** `PATCH /api/user/profile`  
**Purpose:** Update user profile information  
**Authentication:** Required (Bearer token)

#### Request

```typescript
interface UpdateProfileRequest {
  name?: string;         // Optional, max 100 chars
  avatar?: string;       // Optional, base64 or URL, max 5MB
}
```

**Validation Rules:**
- `name`: Optional, max 100 characters, min 1 character
- `avatar`: Optional, valid base64 image or URL, max 5MB

**Example Request:**
```json
{
  "name": "John Smith",
  "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

#### Response (200 OK)

```typescript
interface UpdateProfileResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    updated_at: string;
  };
  message: string;
}
```

**Example Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Smith",
    "avatar_url": "https://storage.supabase.co/avatars/avatar_456.jpg",
    "updated_at": "2025-10-23T10:35:00Z"
  },
  "message": "Profile updated successfully"
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "error": "validation_error",
  "message": "Invalid profile data",
  "details": [
    {
      "field": "name",
      "message": "Name must be between 1 and 100 characters"
    }
  ],
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**400 Bad Request - Invalid Image**
```json
{
  "error": "invalid_image",
  "message": "Avatar image is invalid or too large (max 5MB)",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**413 Payload Too Large**
```json
{
  "error": "payload_too_large",
  "message": "Avatar image exceeds 5MB limit",
  "size": 6291456,
  "max_size": 5242880,
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 3. Get User Statistics

**Endpoint:** `GET /api/user/stats`  
**Purpose:** Retrieve user's game statistics  
**Authentication:** Required (Bearer token)

#### Request

**Query Parameters:**
- `period` (string, optional): Time period for stats ('all', '30d', '7d', 'today')
  - Default: 'all'

#### Response (200 OK)

```typescript
interface UserStatsResponse {
  overview: {
    totalRounds: number;
    totalWins: number;
    totalLosses: number;
    totalAbandoned: number;
    winRate: number;              // 0-1 decimal (e.g., 0.6 = 60%)
  };
  streaks: {
    currentStreak: number;        // Consecutive wins
    bestStreak: number;           // All-time best streak
    lastWinDate: string | null;   // ISO 8601
  };
  performance: {
    averageMessagesToWin: number;    // Average messages in won rounds
    averageMessagesToLoss: number;   // Average messages in lost rounds
    averageRoundDuration: number;    // Seconds
    averageSuccessMeterStart: number; // Average starting meter
    averageSuccessMeterEnd: number;   // Average ending meter (wins only)
  };
  girlPreferences: {
    favoriteEthnicity: string | null;  // Most played ethnicity
    ethnicityBreakdown: Record<string, number>;  // Count per ethnicity
  };
  recentActivity: {
    lastRoundDate: string | null;     // ISO 8601
    roundsToday: number;
    roundsThisWeek: number;
    roundsThisMonth: number;
  };
  accountInfo: {
    accountType: 'free' | 'premium';
    memberSince: string;              // ISO 8601
    daysSinceMember: number;
  };
}
```

**Example Response:**
```json
{
  "overview": {
    "totalRounds": 50,
    "totalWins": 30,
    "totalLosses": 18,
    "totalAbandoned": 2,
    "winRate": 0.625
  },
  "streaks": {
    "currentStreak": 3,
    "bestStreak": 8,
    "lastWinDate": "2025-10-23T09:15:00Z"
  },
  "performance": {
    "averageMessagesToWin": 12.5,
    "averageMessagesToLoss": 6.2,
    "averageRoundDuration": 420,
    "averageSuccessMeterStart": 20,
    "averageSuccessMeterEnd": 100
  },
  "girlPreferences": {
    "favoriteEthnicity": "Asian",
    "ethnicityBreakdown": {
      "Asian": 18,
      "Caucasian": 15,
      "Hispanic/Latina": 12,
      "African American": 5
    }
  },
  "recentActivity": {
    "lastRoundDate": "2025-10-23T10:00:00Z",
    "roundsToday": 3,
    "roundsThisWeek": 12,
    "roundsThisMonth": 50
  },
  "accountInfo": {
    "accountType": "premium",
    "memberSince": "2025-10-01T10:30:00Z",
    "daysSinceMember": 22
  }
}
```

#### Error Responses

**400 Bad Request - Invalid Period**
```json
{
  "error": "invalid_period",
  "message": "Period must be one of: 'all', '30d', '7d', 'today'",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 4. Get Daily Usage Limits

**Endpoint:** `GET /api/user/limits`  
**Purpose:** Check user's current usage against daily limits (for free tier)  
**Authentication:** Required (Bearer token)

#### Request

No parameters required.

#### Response (200 OK)

```typescript
interface UsageLimitsResponse {
  accountType: 'free' | 'premium';
  limits: {
    dailyRounds: number | null;      // null = unlimited (premium)
    roundsUsedToday: number;
    roundsRemainingToday: number | null;  // null = unlimited
    resetAt: string | null;          // ISO 8601, when limit resets
  };
  features: {
    unlimitedRounds: boolean;
    prioritySupport: boolean;
    premiumVoice: boolean;           // ElevenLabs vs PlayHT
    rewardRegeneration: boolean;
    advancedStats: boolean;
  };
}
```

**Example Response (Free Tier):**
```json
{
  "accountType": "free",
  "limits": {
    "dailyRounds": 5,
    "roundsUsedToday": 3,
    "roundsRemainingToday": 2,
    "resetAt": "2025-10-24T00:00:00Z"
  },
  "features": {
    "unlimitedRounds": false,
    "prioritySupport": false,
    "premiumVoice": false,
    "rewardRegeneration": false,
    "advancedStats": false
  }
}
```

**Example Response (Premium Tier):**
```json
{
  "accountType": "premium",
  "limits": {
    "dailyRounds": null,
    "roundsUsedToday": 15,
    "roundsRemainingToday": null,
    "resetAt": null
  },
  "features": {
    "unlimitedRounds": true,
    "prioritySupport": true,
    "premiumVoice": true,
    "rewardRegeneration": true,
    "advancedStats": true
  }
}
```

---

### 5. Delete User Account

**Endpoint:** `DELETE /api/user/account`  
**Purpose:** Permanently delete user account and all associated data  
**Authentication:** Required (Bearer token)

#### Request

```typescript
interface DeleteAccountRequest {
  confirmation: string;  // Must be exact string "DELETE MY ACCOUNT"
  password?: string;     // Required if account has password
  reason?: string;       // Optional feedback
}
```

**Example Request:**
```json
{
  "confirmation": "DELETE MY ACCOUNT",
  "password": "userpassword123",
  "reason": "No longer using the service"
}
```

#### Response (200 OK)

```typescript
interface DeleteAccountResponse {
  message: string;
  deletedAt: string;  // ISO 8601
}
```

**Example Response:**
```json
{
  "message": "Account successfully deleted",
  "deletedAt": "2025-10-23T10:30:00Z"
}
```

#### Error Responses

**400 Bad Request - Invalid Confirmation**
```json
{
  "error": "invalid_confirmation",
  "message": "You must type 'DELETE MY ACCOUNT' to confirm deletion",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**401 Unauthorized - Invalid Password**
```json
{
  "error": "invalid_password",
  "message": "Password is incorrect",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**409 Conflict - Active Subscription**
```json
{
  "error": "active_subscription",
  "message": "Please cancel your subscription before deleting your account",
  "subscriptionEndDate": "2025-11-23T10:30:00Z",
  "cancelUrl": "/settings/subscription",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 6. Get User Achievements

**Endpoint:** `GET /api/user/achievements`  
**Purpose:** Retrieve user's unlocked achievements and progress  
**Authentication:** Required (Bearer token)

#### Request

No parameters required.

#### Response (200 OK)

```typescript
interface AchievementsResponse {
  unlocked: Achievement[];
  locked: Achievement[];
  progress: {
    totalUnlocked: number;
    totalAchievements: number;
    completionPercentage: number;  // 0-100
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;              // Icon identifier or URL
  category: 'wins' | 'streaks' | 'conversations' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string | null;  // ISO 8601, null if locked
  progress?: {
    current: number;
    target: number;
    percentage: number;      // 0-100
  };
}
```

**Example Response:**
```json
{
  "unlocked": [
    {
      "id": "first_win",
      "name": "First Victory",
      "description": "Win your first conversation round",
      "icon": "🏆",
      "category": "wins",
      "rarity": "common",
      "unlockedAt": "2025-10-02T15:20:00Z"
    },
    {
      "id": "win_streak_5",
      "name": "Hot Streak",
      "description": "Win 5 rounds in a row",
      "icon": "🔥",
      "category": "streaks",
      "rarity": "rare",
      "unlockedAt": "2025-10-15T12:30:00Z"
    }
  ],
  "locked": [
    {
      "id": "win_streak_10",
      "name": "Unstoppable",
      "description": "Win 10 rounds in a row",
      "icon": "⚡",
      "category": "streaks",
      "rarity": "epic",
      "unlockedAt": null,
      "progress": {
        "current": 3,
        "target": 10,
        "percentage": 30
      }
    }
  ],
  "progress": {
    "totalUnlocked": 8,
    "totalAchievements": 25,
    "completionPercentage": 32
  }
}
```

---

## Status Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful retrieval or update |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing or invalid auth token |
| 409 | Conflict | Cannot delete account with active subscription |
| 413 | Payload Too Large | Avatar image exceeds 5MB |
| 500 | Internal Server Error | Unexpected error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /profile` | 60 requests | 1 minute per user |
| `PATCH /profile` | 10 requests | 5 minutes per user |
| `GET /stats` | 30 requests | 1 minute per user |
| `GET /limits` | 60 requests | 1 minute per user |
| `DELETE /account` | 3 requests | 1 hour per user |
| `GET /achievements` | 30 requests | 1 minute per user |

---

## Business Logic Notes

### Free Tier Limits

**Daily Round Limit:**
- 5 rounds per day (calendar day, resets at midnight UTC)
- Tracked in separate `daily_usage` table
- Both wins and losses count toward limit
- Abandoned rounds also count

**Round Counting Logic:**
```sql
SELECT COUNT(*) 
FROM game_rounds 
WHERE user_id = $1 
  AND started_at >= CURRENT_DATE 
  AND started_at < CURRENT_DATE + INTERVAL '1 day';
```

### Streak Calculation

**Current Streak:**
- Counts consecutive wins from most recent rounds
- Resets to 0 on any loss
- Abandoned rounds don't affect streak

**Best Streak:**
- All-time highest consecutive win count
- Never decreases, only increases

### Win Rate Calculation

```typescript
winRate = totalWins / (totalWins + totalLosses)
// Abandoned rounds excluded from calculation
```

---

## Integration Notes

### Backend Implementation

```typescript
// src/app/api/user/stats/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Query game_rounds table for statistics
  const { data: rounds } = await supabase
    .from('game_rounds')
    .select('*')
    .eq('user_id', user.id);
  
  // 3. Calculate statistics
  const stats = calculateStats(rounds);
  
  // 4. Return response
  return Response.json(stats);
}
```

### Frontend Implementation

```typescript
// src/lib/api/user.ts
import { useQuery } from '@tanstack/react-query';

export function useUserStats(period: 'all' | '30d' | '7d' | 'today' = 'all') {
  return useQuery({
    queryKey: ['user', 'stats', period],
    queryFn: async () => {
      const response = await fetch(`/api/user/stats?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useUserLimits() {
  return useQuery({
    queryKey: ['user', 'limits'],
    queryFn: async () => {
      const response = await fetch('/api/user/limits');
      if (!response.ok) throw new Error('Failed to fetch limits');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
```

---

## Testing Checklist

### Profile Management
- [ ] Get profile returns correct user data
- [ ] Update profile with valid name succeeds
- [ ] Update profile with avatar succeeds
- [ ] Avatar > 5MB rejected (413)
- [ ] Invalid name rejected (400)
- [ ] Profile updates timestamp correctly

### Statistics
- [ ] Stats calculated correctly for new user (zeros)
- [ ] Win rate calculation accurate
- [ ] Current streak updates on win
- [ ] Current streak resets on loss
- [ ] Best streak never decreases
- [ ] Average calculations exclude abandoned rounds
- [ ] Period filter ('30d', '7d', 'today') works correctly

### Usage Limits
- [ ] Free tier shows correct daily limit (5)
- [ ] Premium tier shows unlimited (null)
- [ ] Rounds used today counts correctly
- [ ] Limit resets at midnight UTC
- [ ] Premium users have all features enabled
- [ ] Free users have features disabled

### Account Deletion
- [ ] Deletion requires correct confirmation text
- [ ] Deletion requires password (if account has one)
- [ ] Active subscription blocks deletion
- [ ] Successful deletion removes all user data
- [ ] Successful deletion signs out user

### Achievements
- [ ] Unlocked achievements show unlock date
- [ ] Locked achievements show progress
- [ ] Achievement progress updates in real-time
- [ ] Completion percentage calculated correctly

