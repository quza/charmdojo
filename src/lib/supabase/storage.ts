/**
 * Supabase Storage utilities for managing girl images and reward assets
 */

import { createClient } from './server';
import { createClient as createBrowserClient } from '@supabase/supabase-js';

const GIRL_IMAGES_BUCKET = 'girl-images';
const REWARD_IMAGES_BUCKET = 'reward-images';
const REWARD_AUDIO_BUCKET = 'reward-audio';

/**
 * Create a service role client for use in standalone scripts/tests
 * This bypasses the cookie-based auth and uses the service role key directly
 */
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or service role key');
  }

  return createBrowserClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get the appropriate Supabase client based on context
 * Returns service role client if not in request context, otherwise regular client
 */
async function getSupabaseClient() {
  // Try to detect if we're in a request context
  try {
    // This will throw if not in request context
    const client = await createClient();
    return client;
  } catch (error) {
    // Not in request context, use service role client
    console.log('⚠️  Not in request context, using service role client');
    return createServiceRoleClient();
  }
}

/**
 * Upload a girl profile image to Supabase Storage
 * @param buffer - Image buffer (PNG, JPEG, etc.)
 * @param filename - Unique filename for the image
 * @returns Public URL of the uploaded image
 */
export async function uploadGirlImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const supabase = await getSupabaseClient();

  // Upload the image
  const { data, error } = await supabase.storage
    .from(GIRL_IMAGES_BUCKET)
    .upload(filename, buffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('❌ Error uploading image to Supabase:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(GIRL_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  console.log(`✅ Image uploaded successfully: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

/**
 * Delete a girl profile image from Supabase Storage
 * @param filename - Filename or path of the image to delete
 */
export async function deleteGirlImage(filename: string): Promise<void> {
  const supabase = await getSupabaseClient();

  const { error } = await supabase.storage
    .from(GIRL_IMAGES_BUCKET)
    .remove([filename]);

  if (error) {
    console.error('⚠️ Error deleting image from Supabase:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  console.log(`🗑️  Image deleted: ${filename}`);
}

/**
 * Get public URL for an image in the girl-images bucket
 * @param path - Path to the image in the bucket
 * @returns Public URL
 */
export function getPublicUrl(path: string): string {
  // This is a client-side safe function that constructs the URL
  // without requiring authentication
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  return `${supabaseUrl}/storage/v1/object/public/${GIRL_IMAGES_BUCKET}/${path}`;
}

/**
 * Generate a unique filename for a girl image
 * @param girlName - Optional girl name to include in filename
 * @returns Unique filename
 */
export function generateImageFilename(girlName?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const sanitizedName = girlName
    ? girlName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    : 'girl';
  
  return `${sanitizedName}_${timestamp}_${random}.png`;
}

// =====================
// REWARD STORAGE FUNCTIONS
// =====================

/**
 * Upload a reward image to Supabase Storage
 * @param buffer - Image buffer (PNG, JPEG, etc.)
 * @param filename - Unique filename for the image
 * @returns Public URL of the uploaded image
 */
export async function uploadRewardImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const supabase = await getSupabaseClient();

  console.log(`📸 Uploading reward image: ${filename}`);

  // Upload the image
  const { data, error } = await supabase.storage
    .from(REWARD_IMAGES_BUCKET)
    .upload(filename, buffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('❌ Error uploading reward image to Supabase:', error);
    throw new Error(`Failed to upload reward image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(REWARD_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  console.log(`✅ Reward image uploaded successfully: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

/**
 * Upload a reward audio file to Supabase Storage
 * @param buffer - Audio buffer (MP3, WAV, etc.)
 * @param filename - Unique filename for the audio
 * @returns Public URL of the uploaded audio file
 */
export async function uploadRewardAudio(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const supabase = await getSupabaseClient();

  console.log(`🎤 Uploading reward audio: ${filename}`);

  // Upload the audio file
  const { data, error } = await supabase.storage
    .from(REWARD_AUDIO_BUCKET)
    .upload(filename, buffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('❌ Error uploading reward audio to Supabase:', error);
    throw new Error(`Failed to upload reward audio: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(REWARD_AUDIO_BUCKET)
    .getPublicUrl(data.path);

  console.log(`✅ Reward audio uploaded successfully: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

/**
 * Generate a unique filename for a reward image
 * @param roundId - Round ID to include in filename
 * @returns Unique filename
 */
export function generateRewardImageFilename(roundId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const shortRoundId = roundId.substring(0, 8);
  
  return `reward_img_${shortRoundId}_${timestamp}_${random}.png`;
}

/**
 * Generate a unique filename for a reward audio file
 * @param roundId - Round ID to include in filename
 * @returns Unique filename
 */
export function generateRewardAudioFilename(roundId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const shortRoundId = roundId.substring(0, 8);
  
  return `reward_audio_${shortRoundId}_${timestamp}_${random}.mp3`;
}
