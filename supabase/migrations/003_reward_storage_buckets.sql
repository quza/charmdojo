-- Create storage buckets for reward assets
-- This migration creates two buckets for storing reward images and audio files

-- =====================
-- REWARD IMAGES BUCKET
-- =====================
-- Stores reward photos (lingerie images)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reward-images',
  'reward-images',
  true,  -- Public access for easy display in UI
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all images in the bucket
CREATE POLICY "Public read access for reward images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reward-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload reward images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reward-images');

-- Allow authenticated users to delete reward images
CREATE POLICY "Authenticated users can delete reward images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reward-images');

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access to reward images"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'reward-images')
WITH CHECK (bucket_id = 'reward-images');

-- =====================
-- REWARD AUDIO BUCKET
-- =====================
-- Stores reward voice files (TTS generated MP3)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reward-audio',
  'reward-audio',
  true,  -- Public access for playback in UI
  10485760,  -- 10MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all audio files in the bucket
CREATE POLICY "Public read access for reward audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reward-audio');

-- Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload reward audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reward-audio');

-- Allow authenticated users to delete reward audio
CREATE POLICY "Authenticated users can delete reward audio"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reward-audio');

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access to reward audio"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'reward-audio')
WITH CHECK (bucket_id = 'reward-audio');







