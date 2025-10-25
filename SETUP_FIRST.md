# ⚠️ Important: Run Database Migration First!

Before running tests or using the image generation system, you **MUST** create the storage bucket by running the migration:

## Quick Setup

### 1. Run the Migration

**Option A: Using Supabase CLI (Recommended)**
```bash
npx supabase db push
```

**Option B: Manual in Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Open and run: `supabase/migrations/002_storage_buckets.sql`

### 2. Verify Bucket Created

Go to Supabase Dashboard → Storage → You should see `girl-images` bucket

### 3. Run Tests

```bash
# Test Imagen API only (doesn't need bucket)
npm run test:imagen

# Test full pipeline (needs bucket)
npm run test:girl-images
```

## What the Migration Does

The `002_storage_buckets.sql` migration creates:
- ✅ `girl-images` storage bucket
- ✅ Public read access (anyone can view images via URL)
- ✅ Authenticated write access (logged-in users can upload)
- ✅ 5MB file size limit
- ✅ PNG/JPEG/WebP format support

## Troubleshooting

### "Bucket not found" Error
→ Run the migration! The bucket doesn't exist yet.

### Migration Already Applied
If you've already run migrations, check in Supabase Dashboard → Storage to verify the bucket exists.

### Manual Bucket Creation
If migrations don't work, you can create the bucket manually:
1. Supabase Dashboard → Storage → New bucket
2. Name: `girl-images`
3. Public: ✅ Yes
4. File size limit: 5242880 (5MB)
5. Allowed MIME types: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`

---

**After running the migration, proceed with testing!**

