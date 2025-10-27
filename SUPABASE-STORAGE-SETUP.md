# Supabase Storage Setup for Profile Avatars

This document provides instructions for setting up the `avatars` bucket in Supabase Storage.

## Step 1: Create the Avatars Bucket

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your CharmDojo project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
6. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies to control access.

### Go to the SQL Editor

1. In your Supabase Dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy and paste the following SQL:

```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

4. Click **"Run"** to execute the policies

## Step 3: Verify the Setup

### Test Upload Access

1. Go to **Storage** > **avatars** bucket
2. Try uploading a test image
3. Check that the image appears in the bucket
4. Verify you can see the public URL

### Test Policies

The policies ensure that:
- ✅ Authenticated users can upload files to their own folder (`{userId}/filename.jpg`)
- ✅ Users can only update/delete their own avatar files
- ✅ Anyone (public) can view avatar images (for displaying in the app)
- ❌ Users cannot delete or modify other users' avatars

## File Structure

Avatars are stored with the following path structure:
```
avatars/
  └── {userId}/
      └── {userId}-{timestamp}.{ext}
```

Example: `avatars/550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440000-1698234567890.jpg`

## Troubleshooting

### "Policy violation" errors
- Ensure the RLS policies are created correctly
- Check that the bucket is set to public
- Verify the user is authenticated

### Images not loading
- Check the public URL format: `https://{project-ref}.supabase.co/storage/v1/object/public/avatars/{path}`
- Ensure the bucket has public access enabled
- Verify the file exists in storage

### Upload fails with "Bucket not found"
- Verify the bucket name is exactly `avatars` (lowercase)
- Check that the bucket was created successfully

## API Integration

The profile page uses these endpoints to interact with avatar storage:

- **POST `/api/user/avatar`** - Upload new avatar
- **DELETE `/api/user/avatar`** - Remove current avatar
- **PATCH `/api/user/profile`** - Update user metadata with avatar URL

All avatar operations are handled automatically by the profile page UI.

