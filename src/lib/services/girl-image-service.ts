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
import { getRandomGirlsFromPool, addGirlToPool } from './girl-pool-service';
import { getRandomFallbackImages } from '@/lib/utils/fallback-images';
import type { GeneratedGirl } from '@/types/game';

export interface GirlImageResult {
  success: boolean;
  imageUrl: string;
  usedPlaceholder: boolean;
  generationTime: number;
  error?: string;
  fromPool?: boolean;
  fromLocalFallback?: boolean;
  girlProfileId?: string; // Database UUID for caching rewards
  // When using pool fallback, we need the complete girl data
  replacementGirl?: {
    name: string;
    attributes: {
      ethnicity: string;
      hairColor: string;
      eyeColor: string;
      bodyType: string;
      hairstyle: string;
      setting: string;
    };
  };
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
 * Generate girl image with multi-tier fallback
 * 
 * Fallback hierarchy:
 * 1. Try Imagen API generation
 * 2. If fails, try random COMPLETE girl from Supabase pool
 * 3. If pool empty, retry generation up to 3 times
 * 4. If all retries fail, return failure (girl will be skipped)
 * 
 * @param girl - Generated girl profile with attributes
 * @returns Result object with image URL and metadata
 */
export async function generateGirlImageWithFallback(
  girl: GeneratedGirl
): Promise<GirlImageResult> {
  const startTime = Date.now();
  
  console.log(`🎨 Generating image for ${girl.name} (with fallback)...`);
  console.log(`   Attributes:`, girl.attributes);

  try {
    // Step 1: Try Imagen generation
    const prompt = substituteGirlPrompt(girl.attributes);
    
    if (!validatePrompt(prompt)) {
      throw new Error('Prompt validation failed - placeholders not replaced');
    }

    console.log(`   ✓ Prompt generated (${prompt.length} chars)`);

    let imageBuffer: Buffer | null = null;

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
      console.error(`   ✗ Imagen generation failed, trying pool fallback...`);
      
      // Step 2: Try getting random COMPLETE girl from Supabase pool
      try {
        const poolGirls = await getRandomGirlsFromPool(1);
        
        if (poolGirls.length > 0) {
          const poolGirl = poolGirls[0];
          console.log(`   ✓ Using complete girl from pool: ${poolGirl.name}`);
          
          // Return complete girl data so it can replace the failed generation
          return {
            success: true,
            imageUrl: poolGirl.image_url,
            usedPlaceholder: false,
            generationTime: (Date.now() - startTime) / 1000,
            fromPool: true,
            girlProfileId: poolGirl.id, // Include the database UUID!
            replacementGirl: {
              name: poolGirl.name,
              attributes: {
                ethnicity: poolGirl.ethnicity,
                hairColor: poolGirl.haircolor,
                eyeColor: poolGirl.eyecolor,
                bodyType: poolGirl.bodytype,
                hairstyle: poolGirl.hairstyle,
                setting: poolGirl.setting,
              },
            },
          };
        }
      } catch (poolError) {
        console.error(`   ✗ Pool fallback failed:`, poolError);
      }
      
      // Step 3: Pool is empty, retry generation up to 3 times
      console.log(`   ⚠️  Pool is empty, retrying generation...`);
      
      let retrySuccess = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`   🔄 Retry attempt ${attempt}/3 for ${girl.name}...`);
          
          const retryImages = await generateImageWithRetry(
            {
              prompt,
              sampleCount: 1,
              aspectRatio: '3:4',
            },
            1 // Single attempt per retry
          );

          imageBuffer = retryImages[0].buffer;
          console.log(`   ✓ Retry successful! Image generated (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
          retrySuccess = true;
          break; // Success, exit retry loop
        } catch (retryError) {
          console.error(`   ✗ Retry attempt ${attempt}/3 failed:`, retryError);
          
          if (attempt === 3) {
            // All retries exhausted, return failure
            console.error(`   ❌ All retry attempts exhausted for ${girl.name}`);
            return {
              success: false,
              imageUrl: '',
              usedPlaceholder: false,
              generationTime: (Date.now() - startTime) / 1000,
              error: 'Failed to generate after 3 retry attempts',
            };
          }
        }
      }
      
      // Safety check - this should never happen due to return above
      if (!retrySuccess || !imageBuffer) {
        return {
          success: false,
          imageUrl: '',
          usedPlaceholder: false,
          generationTime: (Date.now() - startTime) / 1000,
          error: 'Image generation failed unexpectedly',
        };
      }
    }

    // Safety check before upload
    if (!imageBuffer) {
      return {
        success: false,
        imageUrl: '',
        usedPlaceholder: false,
        generationTime: (Date.now() - startTime) / 1000,
        error: 'Image buffer is null',
      };
    }

    // Upload to Supabase Storage
    const filename = generateImageFilename(girl.name);
    const imageUrl = await uploadGirlImage(imageBuffer, filename);
    
    // Add to pool with attributes (use Supabase MCP)
    // Map camelCase attributes to lowercase for database
    const addedProfile = await addGirlToPool({
      name: girl.name,
      image_url: imageUrl,
      attributes: {
        ethnicity: girl.attributes.ethnicity,
        hairstyle: girl.attributes.hairstyle,
        haircolor: girl.attributes.hairColor,
        eyecolor: girl.attributes.eyeColor,
        bodytype: girl.attributes.bodyType,
        setting: girl.attributes.setting,
      },
      source: 'imagen',
      generation_prompt: prompt,
    });
    
    const generationTime = (Date.now() - startTime) / 1000;
    console.log(`   ✅ Complete for ${girl.name} (${generationTime.toFixed(2)}s)`);

    return {
      success: true,
      imageUrl,
      usedPlaceholder: false,
      generationTime,
      girlProfileId: addedProfile?.id, // Return the database UUID!
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

