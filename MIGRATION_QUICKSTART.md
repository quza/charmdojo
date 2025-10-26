# Quick Start: Applying the Girl Pool Migration

## Step 1: Apply the Database Migration

You need to apply the migration `003_girl_profiles_pool.sql` to your Supabase database.

### Option A: Using Supabase MCP (Recommended)

Simply tell the AI agent:

```
use supabase MCP to apply migration supabase/migrations/003_girl_profiles_pool.sql
```

The Supabase MCP will:
1. Connect to your Supabase project
2. Execute the migration SQL
3. Confirm table creation

### Option B: Manual Application via Supabase Dashboard

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/003_girl_profiles_pool.sql`
6. Paste into the SQL editor
7. Click **Run**

### Option C: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply all pending migrations
npx supabase db push

# Or apply specific migration
npx supabase db execute --file supabase/migrations/003_girl_profiles_pool.sql
```

---

## Step 2: Verify Migration Success

Run this query in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT COUNT(*) FROM girl_profiles;

-- Should return: 0 (empty table)

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_girl_pool_size', 'get_random_girls');

-- Should return: 2 rows
```

---

## Step 3: Test the System

### Start Development Server

```bash
npm run dev
```

### Make a Test Request

```bash
# You need to be authenticated
# The API will return pool size in metadata

curl -X POST http://localhost:3000/api/game/generate-girls \
  -H "Cookie: your-auth-cookie" \
  -H "Content-Type: application/json"
```

Expected response:

```json
{
  "success": true,
  "girls": [...],
  "metadata": {
    "totalTime": 5.2,
    "poolSize": 0,        ← Should start at 0
    "poolMode": false     ← Should be false (generation mode)
  }
}
```

### Watch the Console

You should see:

```
📊 Current pool size: 0/2000
✓ Pool building mode (2000 remaining)
🎨 Generating image for Emma (with fallback)...
✓ Generated 3/3 girls, added to pool
```

---

## Step 4: Monitor Pool Growth

After each request, the pool will grow:

```
Request 1: 0 → 3 girls
Request 2: 3 → 6 girls
Request 3: 6 → 9 girls
...
Request 667: 1998 → 2000 girls (full!)
```

Once the pool reaches 2000:

```
📊 Current pool size: 2000/2000
✓ Pool at capacity, selecting from existing profiles
✓ Selected 3 girls from pool
```

---

## Troubleshooting

### Migration fails with "relation already exists"

The table might already exist. Drop it first:

```sql
DROP TABLE IF EXISTS public.girl_profiles CASCADE;
-- Then re-run the migration
```

### "Function get_girl_pool_size does not exist"

Re-run the migration. The functions should be created automatically.

### Pool size not incrementing

Check the database:

```sql
SELECT COUNT(*) FROM girl_profiles;
```

If it's not incrementing, check:
- Supabase connection is working
- No database errors in console logs
- `addGirlToPool()` function is being called

---

## Next Steps

Once the migration is applied:

1. ✅ Make a few test requests
2. ✅ Verify girls are being added to pool
3. ✅ Check that attributes are stored correctly
4. ✅ Test fallback systems (disable Imagen API key temporarily)
5. ✅ Monitor until pool reaches 2000

---

## Need Help?

Refer to:
- `GIRL_POOL_SYSTEM_README.md` - Complete documentation
- `GIRL_POOL_IMPLEMENTATION_SUMMARY.md` - Implementation details
- Console logs during requests

