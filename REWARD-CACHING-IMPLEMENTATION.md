# Reward Caching Implementation

## Overview

This implementation adds reward caching to the CharmDojo application, allowing rewards (text, voice, and image) to be stored on girl profiles and reused when the same girl is selected in future rounds.

## Changes Made

### 1. Database Migration (`supabase/migrations/004_add_reward_caching.sql`)

**Added to `girl_profiles` table:**
- `reward_text` (TEXT) - Cached reward text
- `reward_voice_url` (TEXT) - Cached reward voice URL
- `reward_image_url` (TEXT) - Cached reward image URL
- `reward_description` (TEXT) - Cached girl description for consistency
- `rewards_generated` (BOOLEAN) - Flag indicating if rewards exist

**Added to `game_rounds` table:**
- `girl_profile_id` (UUID) - Foreign key linking to `girl_profiles`

**Indexes created:**
- `idx_game_rounds_girl_profile_id` - Performance index for FK lookups
- `idx_girl_profiles_rewards_generated` - Fast filtering of girls with cached rewards

### 2. TypeScript Types (`src/types/database.ts`)

Updated database type definitions to include:
- `girl_profiles` table with all reward caching fields
- `girl_profile_id` field in `game_rounds` table
- Foreign key relationship between tables

### 3. Start Round API (`src/app/api/game/start-round/route.ts`)

Modified round creation to include:
- `girl_profile_id: girlId` in the insert payload
- This links new rounds to girl profiles for reward caching

### 4. Reward Service (`src/lib/services/reward-service.ts`)

**Added Helper Functions:**

1. **`checkCachedRewards(girlProfileId)`**
   - Checks if a girl profile has cached rewards
   - Returns cached rewards if available, null otherwise
   - Uses service role client to bypass RLS

2. **`cacheRewardsToProfile(girlProfileId, rewards)`**
   - Stores generated rewards on the girl profile
   - Sets `rewards_generated` flag to true
   - Uses service role client for unrestricted access

3. **`saveRewardToHistory(roundId, rewardData)`**
   - Saves reward to `rewards` table for historical tracking
   - Non-critical operation (won't fail reward generation if it fails)

**Modified `generateCompleteReward()` function:**
- Now includes `girl_profile_id` in round data query
- Checks for cached rewards before generation
- If cached rewards found:
  - Returns cached rewards immediately (fast path)
  - Still saves to `rewards` table for history
  - Total time ~0.1-0.5s vs 20-60s for generation
- If no cache available:
  - Generates rewards normally
  - Caches to girl profile after successful generation
  - Saves to `rewards` table for history

## How It Works

### First Win with a Girl
1. User selects a girl from the pool
2. Plays round and wins
3. Reward generation triggered:
   - Checks cache: none found (first time)
   - Generates text, voice, and image (~20-60s)
   - Caches all assets to `girl_profiles` table
   - Saves to `rewards` table for this round
   - Returns generated rewards

### Subsequent Wins with Same Girl
1. User selects the same girl again (can happen randomly from pool)
2. Plays round and wins
3. Reward generation triggered:
   - Checks cache: **found cached rewards!**
   - Returns cached rewards immediately (~0.1-0.5s)
   - Saves entry to `rewards` table for history
   - **No API calls needed** → saves ~$0.32 per win

## Testing the Implementation

### Prerequisites

1. Run the migration:
```bash
# Using Supabase MCP
mcp_supabase_apply_migration {
  "project_id": "ketkanvkuzmnbsebeuax",
  "name": "add_reward_caching",
  "query": "<paste content of 004_add_reward_caching.sql>"
}

# Or using Supabase CLI
supabase db push
```

2. Verify tables updated:
```sql
-- Check girl_profiles has new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'girl_profiles'
AND column_name IN ('reward_text', 'reward_voice_url', 'reward_image_url', 'reward_description', 'rewards_generated');

-- Check game_rounds has new column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'game_rounds'
AND column_name = 'girl_profile_id';
```

### Test Scenario 1: First Win (Generate & Cache)

1. Start the app and play a round
2. Select a girl (note the girl's name and ID)
3. Win the round
4. Observe console logs:
   - Should see: "🔨 Generating new rewards (no cache available)"
   - Should see: "💾 Caching rewards to girl profile..."
   - Should see: "✓ Rewards cached successfully"
5. Check database:
```sql
SELECT id, name, rewards_generated, reward_text, reward_voice_url, reward_image_url
FROM girl_profiles
WHERE id = '<girl_id>';
```
   - `rewards_generated` should be `true`
   - `reward_text` should have content
   - `reward_voice_url` and `reward_image_url` should have URLs

### Test Scenario 2: Subsequent Win (Use Cache)

1. Start a new round with the **same girl** from Test 1
   - You may need to keep refreshing girl selection until she appears
   - Or manually query the database to get her ID and select her
2. Win the round
3. Observe console logs:
   - Should see: "🔍 Checking for cached rewards..."
   - Should see: "✓ Found cached rewards!"
   - Should see: "🚀 Using cached rewards (fast path)"
   - Should see: "✅ Cached rewards returned in 0.XX s" (very fast!)
4. Verify rewards displayed correctly in UI
5. Check `rewards` table:
```sql
SELECT * FROM rewards WHERE round_id = '<round_id>';
```
   - Should have a new entry with the cached reward data

### Test Scenario 3: Backward Compatibility

1. Check existing rounds (created before migration):
```sql
SELECT id, girl_profile_id FROM game_rounds WHERE completed_at < NOW();
```
   - `girl_profile_id` should be `null` for old rounds
2. Win a round with a new girl (not in pool)
   - Should still work normally
   - No errors should occur

### Test Scenario 4: Verify Cost Savings

1. Monitor API costs in console logs:
   - First win: ~$0.32 (full generation)
   - Cached wins: ~$0.00 (no API calls)
2. Check generation times:
   - First win: 20-60 seconds
   - Cached wins: <1 second

## Expected Behavior

### Console Logs

**First Win (No Cache):**
```
🎁 Starting complete reward generation for round abc123...
================================================
🔍 Checking for cached rewards for girl profile def456...
   No cached rewards found
   🔨 Generating new rewards (no cache available)

💬 Generating reward text for Emma (attempt 1/3)...
✓ Reward text generated in 2.34s

🔄 Starting parallel generation (voice + image)...
🎤 Generating reward voice...
🖼️ Generating reward image...

================================================
✅ Complete reward generation finished
   Total time: 28.45s
   Text: 2.34s
   Voice: 8.12s (success)
   Image: 18.23s (success)

💾 Caching rewards to girl profile def456...
   ✓ Rewards cached successfully
📝 Saving reward to history for round abc123...
   ✓ Reward saved to history
```

**Subsequent Win (With Cache):**
```
🎁 Starting complete reward generation for round xyz789...
================================================
🔍 Checking for cached rewards for girl profile def456...
   ✓ Found cached rewards!
      Text: Mmm, you definitely know how to keep a girl in...
      Voice: available
      Image: available
   🚀 Using cached rewards (fast path)
📝 Saving reward to history for round xyz789...
   ✓ Reward saved to history

================================================
✅ Cached rewards returned in 0.12s
```

## Benefits

1. **Cost Reduction:** Saves ~$0.32 per cached win (no AI API calls)
2. **Speed Improvement:** <1 second vs 20-60 seconds
3. **Consistency:** Same girl always gives same reward
4. **Scalability:** As pool grows to 2000 girls, cache hit rate increases
5. **User Experience:** Near-instant reward delivery for repeat girls

## Architecture Notes

- **Backward Compatible:** Existing rounds continue to work (null `girl_profile_id`)
- **Non-Destructive:** `rewards` table keeps full history of all wins
- **Fail-Safe:** Cache failures don't break reward generation
- **Flexible:** Can invalidate cache by setting `rewards_generated = false`
- **RLS-Aware:** Uses service role client for caching operations

## Future Enhancements

1. **Prioritize Cached Girls:** Modify girl selection to prefer girls with `rewards_generated = true`
2. **Cache Invalidation:** Add admin tool to regenerate rewards for specific girls
3. **Analytics:** Track cache hit rate and cost savings
4. **Variation:** Allow multiple reward variations per girl (store as array)

## Troubleshooting

### Cache Not Working

**Problem:** Rewards regenerate every time
**Check:**
1. Is `girl_profile_id` being set in `start-round` API?
2. Are rewards being cached (check `rewards_generated` flag)?
3. Console logs showing "No cached rewards found"?

**Solution:**
```sql
-- Manually verify girl profile
SELECT * FROM girl_profiles WHERE id = '<girl_id>';

-- Check round linkage
SELECT id, girl_profile_id FROM game_rounds WHERE id = '<round_id>';
```

### Migration Errors

**Problem:** Migration fails to apply
**Check:**
1. Are there conflicts with existing columns?
2. Does the foreign key reference exist?

**Solution:**
```sql
-- Verify girl_profiles table exists
SELECT * FROM girl_profiles LIMIT 1;

-- Check for existing columns (shouldn't exist)
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'girl_profiles' 
AND column_name IN ('reward_text', 'rewards_generated');
```

## Conclusion

The reward caching system is now fully implemented and ready for testing. It provides significant cost and performance benefits while maintaining backward compatibility and data integrity.

