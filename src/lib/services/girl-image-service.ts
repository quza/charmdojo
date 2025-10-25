/**
 * Girl Image Generation Service
 * 
 * Main service for generating girl profile images using Google Imagen API
 * with fallback to placeholder images when generation fails
 */

import { generateImageWithRetry } from '@/lib/ai/imagen';
import { substituteGirlPrompt, validatePrompt } from '@/lib/utils/prompt-substitutor';
import { generatePlaceholderImage } from '@/lib/utils/placeholder-generator';
import { uploadGirlImage, generateImageFilename } from '@/lib/supabase/storage';
import type { GeneratedGirl } from '@/types/game';

export interface GirlImageResult {
  success: boolean;
  imageUrl: string;
  usedPlaceholder: boolean;
  generationTime: number;
  error?: string;
}

/**
 * Generate and upload a girl profile image
 * 
 * This is the main function that orchestrates the entire image generation pipeline:
 * 1. Substitutes prompt with girl's attributes
 * 2. Calls Imagen API with retry logic (max 3 attempts)
 * 3. Uploads successful image to Supabase Storage
 * 4. If all retries fail, generates a placeholder image
 * 5. Returns the public URL
 * 
 * @param girl - Generated girl profile with attributes
 * @returns Result object with image URL and metadata
 */
export async function generateGirlImage(
  girl: GeneratedGirl
): Promise<GirlImageResult> {
  const startTime = Date.now();
  
  console.log(`🎨 Generating image for ${girl.name}...`);
  console.log(`   Attributes:`, girl.attributes);

  try {
    // Step 1: Substitute prompt with attributes
    const prompt = substituteGirlPrompt(girl.attributes);
    
    if (!validatePrompt(prompt)) {
      throw new Error('Prompt validation failed - placeholders not replaced');
    }

    console.log(`   ✓ Prompt generated (${prompt.length} chars)`);

    // Step 2: Generate image with Imagen API (with retry)
    let imageBuffer: Buffer;
    let usedPlaceholder = false;

    try {
      const images = await generateImageWithRetry(
        {
          prompt,
          sampleCount: 1,
          aspectRatio: '3:4',
        },
        3 // Max 3 retry attempts
      );

      imageBuffer = images[0].buffer;
      console.log(`   ✓ Image generated via Imagen (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    } catch (imagenError) {
      console.error(`   ✗ Imagen generation failed after retries:`, imagenError);
      console.log(`   ⚠️  Falling back to placeholder image`);
      
      // Fallback to placeholder
      imageBuffer = await generatePlaceholderImage(girl);
      usedPlaceholder = true;
      console.log(`   ✓ Placeholder generated (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    }

    // Step 3: Upload to Supabase Storage
    const filename = generateImageFilename(girl.name);
    const imageUrl = await uploadGirlImage(imageBuffer, filename);
    
    const generationTime = (Date.now() - startTime) / 1000;
    
    console.log(`   ✅ Complete for ${girl.name} (${generationTime.toFixed(2)}s)`);

    return {
      success: true,
      imageUrl,
      usedPlaceholder,
      generationTime,
    };
  } catch (error) {
    const generationTime = (Date.now() - startTime) / 1000;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`   ❌ Failed to generate image for ${girl.name}:`, error);

    return {
      success: false,
      imageUrl: '',
      usedPlaceholder: false,
      generationTime,
      error: errorMessage,
    };
  }
}

/**
 * Generate images for multiple girls in parallel
 * 
 * @param girls - Array of generated girl profiles
 * @returns Array of results for each girl
 */
export async function generateMultipleGirlImages(
  girls: GeneratedGirl[]
): Promise<GirlImageResult[]> {
  console.log(`\n🎨 Generating ${girls.length} girl images in parallel...\n`);
  
  const startTime = Date.now();

  // Generate all images in parallel for speed
  const results = await Promise.all(
    girls.map(girl => generateGirlImage(girl))
  );

  const totalTime = (Date.now() - startTime) / 1000;
  const successCount = results.filter(r => r.success).length;
  const placeholderCount = results.filter(r => r.usedPlaceholder).length;

  console.log(`\n✅ Batch generation complete:`);
  console.log(`   Total time: ${totalTime.toFixed(2)}s`);
  console.log(`   Success rate: ${successCount}/${girls.length}`);
  console.log(`   Placeholders used: ${placeholderCount}`);
  console.log('');

  return results;
}

/**
 * Clean up old girl images from storage
 * @param imageUrls - Array of image URLs to delete
 */
export async function cleanupGirlImages(imageUrls: string[]): Promise<void> {
  // Extract filenames from URLs and delete
  // This can be used to clean up temporary/unused images
  console.log(`🗑️  Cleaning up ${imageUrls.length} images...`);
  
  // Implementation would extract filenames and call deleteGirlImage
  // Left as future enhancement
}

