# Girl Profile Pool System

Complete implementation of the pre-generated girl pool strategy for CharmDojo.

## Overview

This system manages a pool of 2000 pre-generated girl profiles, automatically switching between generation and selection modes based on pool size.

### Key Features

- **Automatic Mode Switching**: Generates girls until pool reaches 2000, then switches to selection mode
- **Multi-Tier Fallback System**: Imagen API → Supabase Pool → Local Files
- **Full Attribute Tracking**: All girl attributes stored in database
- **Unique Selection**: Ensures no duplicate girls in 3-girl selection screen
- **Usage Tracking**: Tracks how many times each girl has been selected

---

## Architecture

### Database Schema

**Table**: `girl_profiles`

```sql
CREATE TABLE public.girl_profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    
    -- Attributes
    ethnicity TEXT NOT NULL,
    hairstyle TEXT NOT NULL,
    haircolor TEXT NOT NULL,
    eyecolor TEXT NOT NULL,
    bodytype TEXT NOT NULL,
    setting TEXT NOT NULL,
    
    -- Metadata
    source TEXT CHECK (source IN ('imagen', 'placeholder', 'fallback')),
    generation_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    use_count INTEGER DEFAULT 0
);
```

### Fallback Hierarchy

```
User Request
    ↓
┌─────────────────────────┐
│  Check Pool Size        │
└─────────┬───────────────┘
          │
          ├─── Pool >= 2000 ──→ SELECT MODE
          │                      ├─ Get 3 random girls from pool
          │                      ├─ Mark as used
          │                      └─ Return profiles
          │
          └─── Pool < 2000 ───→ GENERATION MODE
                                 │
                                 ↓
                          Try Imagen Generation
                                 │
                                 ├─ Success → Upload → Add to pool
                                 │
                                 └─ Failure
                                       ↓
                                 Try Supabase Pool (random)
                                       │
                                       ├─ Success → Return cached image
                                       │
                                       └─ Failure
                                             ↓
                                       Try Local Fallback (20 images)
                                             │
                                             ├─ Success → Return local image
                                             │
                                             └─ Failure → Generate placeholder SVG
```

---

## File Structure

```
src/
├── lib/
│   ├── services/
│   │   ├── girl-pool-service.ts         # Pool management functions
│   │   └── girl-image-service.ts         # Image generation with fallback
│   └── utils/
│       └── fallback-images.ts            # Local fallback image handler
├── app/api/game/
│   └── generate-girls/
│       └── route.ts                      # API endpoint (updated)
└── types/
    └── game.ts                           # Type definitions (updated)

supabase/
└── migrations/
    └── 003_girl_profiles_pool.sql       # Database migration

public/
└── fallback-images/
    └── fallback-girls/                  # 20 pre-generated images
```

---

## API Functions

### Pool Management (`girl-pool-service.ts`)

#### `getPoolSize()`
Get current number of girls in pool.

```typescript
const poolSize = await getPoolSize();
console.log(`Pool: ${poolSize}/2000`);
```

#### `addGirlToPool(girl)`
Add newly generated girl to pool.

```typescript
await addGirlToPool({
  name: 'Sophia',
  image_url: 'https://...',
  attributes: { ethnicity, hairstyle, ... },
  source: 'imagen',
  generation_prompt: 'Generate a realistic photo...',
});
```

#### `getRandomGirlsFromPool(count)`
Get N random unique girls from pool.

```typescript
const girls = await getRandomGirlsFromPool(3);
// Returns 3 unique GirlProfile objects
```

#### `markGirlAsUsed(girlId)`
Update usage statistics when girl is selected.

```typescript
await markGirlAsUsed(girl.id);
```

---

### Image Generation (`girl-image-service.ts`)

#### `generateGirlImageWithFallback(girl)`
Generate image with multi-tier fallback.

```typescript
const result = await generateGirlImageWithFallback({
  name: 'Emma',
  attributes: { ethnicity: 'Asian', ... }
});

// Returns:
{
  success: true,
  imageUrl: 'https://...',
  usedPlaceholder: false,
  generationTime: 2.5,
  fromPool?: boolean,
  fromLocalFallback?: boolean
}
```

---

### Fallback Images (`fallback-images.ts`)

#### `getRandomFallbackImages(count)`
Get N random unique local fallback images.

```typescript
const images = getRandomFallbackImages(3);
// Returns: ['/fallback-images/fallback-girls/sophia_...png', ...]
```

#### `getNameFromFallbackFile(filename)`
Extract girl name from filename.

```typescript
const name = getNameFromFallbackFile('sophia_1761428755603_mfsv0gjnll.png');
// Returns: "Sophia"
```

---

## Usage Flow

### Generation Mode (Pool < 2000)

```typescript
// User clicks "Start Matching"
POST /api/game/generate-girls

// Server:
1. Check pool size → 1500/2000 (GENERATION MODE)
2. Generate 3 girl profiles with random attributes
3. For each girl:
   a. Try Imagen API
   b. If fails → Try random from pool
   c. If fails → Use local fallback
   d. If fails → Generate placeholder
4. Upload successful images to Supabase Storage
5. Add all 3 girls to pool (with attributes)
6. Return 3 Girl objects to client

// Pool size now: 1503/2000
```

### Selection Mode (Pool >= 2000)

```typescript
// User clicks "Start Matching"
POST /api/game/generate-girls

// Server:
1. Check pool size → 2000/2000 (SELECTION MODE)
2. Query database: SELECT 3 random girls from pool
3. Mark selected girls as used (increment use_count)
4. Return 3 Girl objects to client (instant, <1s)

// No API calls needed!
// No cost incurred!
```

---

## Migration Instructions

### 1. Apply Database Migration

**Option A: Using Supabase MCP**

```
use supabase MCP to apply migration 003_girl_profiles_pool.sql
```

**Option B: Supabase Dashboard**

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/003_girl_profiles_pool.sql`
3. Run the migration
4. Verify:
   ```sql
   SELECT COUNT(*) FROM girl_profiles;
   ```

### 2. Verify Fallback Images

```bash
ls -la public/fallback-images/fallback-girls/
# Should show 20 images
```

### 3. Test the System

#### Test Generation Mode
```bash
# With pool < 2000
curl -X POST http://localhost:3000/api/game/generate-girls \
  -H "Cookie: sb-auth-token=..." \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "girls": [...],
  "metadata": {
    "totalTime": 5.2,
    "poolSize": 3,
    "poolMode": false  // Generation mode
  }
}
```

#### Test Pool Mode
```bash
# After pool reaches 2000
curl -X POST http://localhost:3000/api/game/generate-girls \
  -H "Cookie: sb-auth-token=..." \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "girls": [...],
  "metadata": {
    "totalTime": 0.8,
    "poolSize": 2000,
    "poolMode": true  // Selection mode
  }
}
```

---

## Cost Analysis

### Before Pool System
```
Cost per user request (3 girls):
- Imagen API: 3 × $0.04 = $0.12
- 100 users/day = $12/day = $360/month
```

### After Pool System (Generation Mode)
```
Cost during pool building (0-2000 girls):
- 2000 girls ÷ 3 per request = 667 requests
- 667 × $0.12 = $80 total one-time cost
```

### After Pool System (Selection Mode)
```
Cost after pool is full:
- Imagen API: $0 (using cached images)
- 100 users/day = $0/day
- Ongoing cost: $0 for image generation
```

**Savings: 100% after pool is populated!**

---

## Monitoring

### Check Pool Statistics

```typescript
import { getPoolStats } from '@/lib/services/girl-pool-service';

const stats = await getPoolStats();
console.log(stats);
// {
//   total: 2000,
//   bySource: {
//     imagen: 1850,
//     placeholder: 100,
//     fallback: 50
//   }
// }
```

### Check Pool Size in Console

Watch server logs during requests:

```
📊 Current pool size: 1523/2000
✓ Pool building mode (477 remaining)
✓ Generated 3/3 girls, added to pool
```

---

## Testing Checklist

- [ ] Migration applied successfully
- [ ] `girl_profiles` table exists with correct schema
- [ ] Helper functions `get_girl_pool_size()` and `get_random_girls()` work
- [ ] 20 fallback images present in `/public/fallback-images/fallback-girls/`
- [ ] Generation mode works (pool < 2000)
- [ ] Selection mode works (pool >= 2000)
- [ ] 3 girls are always unique (no duplicates)
- [ ] Fallback: Imagen failure → Pool selection works
- [ ] Fallback: Supabase failure → Local images works
- [ ] Attributes stored and retrieved correctly
- [ ] Usage tracking increments correctly

---

## Future Enhancements

1. **Admin Dashboard**: View pool statistics, most/least used girls
2. **Pool Maintenance**: Periodic regeneration of low-quality images
3. **Smart Selection**: Prioritize less-used girls for variety
4. **Analytics**: Track generation success rate, fallback usage
5. **Image Quality Scoring**: Users can rate girls, replace low-rated ones

---

## Troubleshooting

### Pool size not incrementing
- Check database connection
- Verify `addGirlToPool()` is being called
- Check for database errors in logs

### Getting same girls repeatedly
- Verify `get_random_girls()` function uses `ORDER BY RANDOM()`
- Check if pool has enough diversity

### Fallback images not working
- Verify path: `/public/fallback-images/fallback-girls/`
- Check file permissions
- Ensure files match pattern `*.png|jpg|jpeg|webp`

### Generation mode stuck
- Check if Imagen API key is valid
- Verify Supabase Storage is accessible
- Check network connectivity

---

## Summary

The girl profile pool system:
- ✅ Automatically builds a pool of 2000 girls
- ✅ Switches to instant selection when pool is full
- ✅ Provides 3-tier fallback for reliability
- ✅ Tracks all attributes for consistency
- ✅ Ensures unique selections
- ✅ Reduces costs by 100% after pool is populated

**Status**: Ready for production use
**Estimated time to fill pool**: ~667 requests (~1-2 days with normal traffic)

