-- Create storage bucket for girl profile images
-- This bucket will store all AI-generated girl profile images

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'girl-images',
  'girl-images',
  true,  -- Public access for easy display in UI
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all images in the bucket
CREATE POLICY "Public read access for girl images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'girl-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload girl images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'girl-images');

-- Allow authenticated users to delete their own uploaded images
CREATE POLICY "Authenticated users can delete girl images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'girl-images');

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'girl-images')
WITH CHECK (bucket_id = 'girl-images');

