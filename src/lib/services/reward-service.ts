/**
 * Reward Service - Orchestrates complete reward generation
 * Generates text, voice, and image rewards in parallel
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { generateVoice, validateTextForVoice } from '@/lib/ai/elevenlabs';
import { generateImage } from '@/lib/ai/imagen';
import {
  uploadRewardImage,
  uploadRewardAudio,
  generateRewardImageFilename,
  generateRewardAudioFilename,
} from '@/lib/supabase/storage';
import { RewardGenerationResult } from '@/types/reward';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { setRewardStatus, clearRewardStatus } from './reward-status';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }
  return openaiClient;
}

/**
 * Load reward text prompt template
 */
function loadRewardTextPrompt(): string {
  const promptPath = path.join(
    process.cwd(),
    'src/prompts/reward_text_prompt.md'
  );
  return fs.readFileSync(promptPath, 'utf-8');
}

/**
 * Load reward photo prompt template
 */
function loadRewardPhotoPrompt(): string {
  const promptPath = path.join(
    process.cwd(),
    'src/prompts/reward_photo_prompt.md'
  );
  return fs.readFileSync(promptPath, 'utf-8');
}

/**
 * Generate flirtatious reward text using GPT-4 with retry logic
 * Includes content validation and regeneration for NSFW failures
 * 
 * @param girlName - Name of the girl
 * @param girlPersona - Personality type (e.g., "playful", "confident")
 * @param maxAttempts - Maximum retry attempts (default: 3)
 * @param timeout - Timeout per attempt in ms (default: 5000)
 * @returns Flirtatious message (15-50 words)
 */
async function generateRewardText(
  girlName: string,
  girlPersona: string,
  maxAttempts: number = 3,
  timeout: number = 5000
): Promise<string> {
  const openai = getOpenAIClient();
  const promptTemplate = loadRewardTextPrompt();
  const systemPrompt = `You are ${girlName}, a ${girlPersona} woman who has been successfully charmed through conversation.`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`💬 Generating reward text for ${girlName} (attempt ${attempt}/${maxAttempts})...`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await openai.chat.completions.create(
          {
            model: 'gpt-4-turbo',
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: promptTemplate,
              },
            ],
            temperature: 0.9, // High for variety
            max_tokens: 100,
          },
          {
            signal: controller.signal as any,
          }
        );

        clearTimeout(timeoutId);

        const rewardText = response.choices[0]?.message?.content?.trim();

        if (!rewardText) {
          throw new Error('Empty response from GPT-4 for reward text');
        }

        // Validate the generated text
        const validation = validateRewardText(rewardText);
        
        if (!validation.isValid) {
          console.warn(`⚠️  Reward text validation failed: ${validation.reason}`);
          lastError = new Error(`Validation failed: ${validation.reason}`);
          
          // If not last attempt, retry
          if (attempt < maxAttempts) {
            console.log(`   Retrying (${maxAttempts - attempt} attempts remaining)...`);
            continue;
          }
          
          throw lastError;
        }

        // Success!
        const wordCount = rewardText.split(/\s+/).length;
        console.log(`✅ Reward text generated successfully (${wordCount} words)`);
        console.log(`   "${rewardText.substring(0, 60)}${rewardText.length > 60 ? '...' : ''}"`);

        return rewardText;

      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error(`GPT-4 timeout exceeded (${timeout}ms)`);
        }
        
        throw error;
      }

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      // If not last attempt, retry after a short delay
      if (attempt < maxAttempts) {
        const delay = Math.min(500 * attempt, 1500); // 500ms, 1000ms, 1500ms
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts exhausted
  throw new Error(
    `Failed to generate valid reward text after ${maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Validate reward text meets content and length requirements
 * @param text - Generated reward text to validate
 * @returns Validation result with isValid flag and optional reason
 */
function validateRewardText(text: string): { isValid: boolean; reason?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'Empty reward text' };
  }

  // Check word count (10-60 words for buffer, target 15-50)
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 10) {
    return { isValid: false, reason: `Too short: ${wordCount} words` };
  }
  if (wordCount > 60) {
    return { isValid: false, reason: `Too long: ${wordCount} words` };
  }

  // Check for explicit NSFW keywords
  const nsfwKeywords = [
    'nude', 'naked', 'sex', 'fuck', 'dick', 'cock', 'pussy', 
    'porn', 'explicit', 'nsfw', 'breast', 'nipple', 'penis',
    'vagina', 'cum', 'orgasm', 'masturbat'
  ];
  
  const lowerText = text.toLowerCase();
  const hasNSFW = nsfwKeywords.some(keyword => lowerText.includes(keyword));
  
  if (hasNSFW) {
    return { isValid: false, reason: 'Contains explicit/NSFW content' };
  }

  return { isValid: true };
}

/**
 * Generate reward voice from text and upload to storage
 * @param rewardText - Text to convert to speech
 * @param roundId - Round ID for filename
 * @returns Public URL of uploaded audio file, or null if failed
 */
async function generateRewardVoice(
  rewardText: string,
  roundId: string
): Promise<string | null> {
  try {
    console.log(`🎤 Generating reward voice...`);

    // Validate text
    validateTextForVoice(rewardText);

    // Generate voice audio (automatically prepends [orgasmic])
    const audioBuffer = await generateVoice(rewardText);

    // Upload to Supabase Storage
    const filename = generateRewardAudioFilename(roundId);
    const audioUrl = await uploadRewardAudio(audioBuffer, filename);

    console.log(`✅ Reward voice generated and uploaded`);

    return audioUrl;
  } catch (error: any) {
    console.error('❌ Reward voice generation failed:', error.message);
    console.log('   Continuing without voice...');
    return null;
  }
}

/**
 * Generate reward image from girl description and upload to storage
 * @param girlDescription - Detailed physical description
 * @param roundId - Round ID for filename
 * @param onRetry - Optional callback for retry notifications
 * @returns Public URL of uploaded image, or null if failed
 */
async function generateRewardImage(
  girlDescription: string,
  roundId: string,
  onRetry?: (attempt: number, maxAttempts: number) => void
): Promise<string | null> {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt === 1) {
        console.log(`📸 Generating reward image...`);
      } else {
        console.log(`🔄 Retrying reward image generation (attempt ${attempt}/${maxAttempts})...`);
        // Notify frontend of retry
        if (onRetry) {
          onRetry(attempt, maxAttempts);
        }
      }

      // Load and substitute prompt
      const promptTemplate = loadRewardPhotoPrompt();
      let prompt = promptTemplate.replace('<girl-description>', girlDescription);

      // Validate prompt substitution
      if (prompt.includes('<girl-description>')) {
        throw new Error('Failed to substitute girl description in prompt');
      }

      // On retry attempts, add additional safety filters to the prompt
      if (attempt > 1) {
        prompt = prompt + ' Keep the image tasteful and appropriate. Focus on elegant, artistic portrayal.';
      }

      // Generate image using Imagen
      const images = await generateImage({
        prompt,
        sampleCount: 1,
        aspectRatio: '3:4',
      });

      const imageBuffer = images[0].buffer;

      // Upload to Supabase Storage
      const filename = generateRewardImageFilename(roundId);
      const imageUrl = await uploadRewardImage(imageBuffer, filename);

      console.log(`✅ Reward image generated and uploaded`);

      return imageUrl;
    } catch (error: any) {
      lastError = error;
      const isContentFiltered = error.message?.includes('Content filtered');
      
      if (isContentFiltered) {
        console.error(`⚠️ Attempt ${attempt}/${maxAttempts} - Content filtered by Google Responsible AI`);
        
        // If we have more attempts, continue to retry
        if (attempt < maxAttempts) {
          const delay = 1000 * attempt; // 1s, 2s
          console.log(`   Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // For non-content-filter errors or last attempt, log and break
      console.error(`❌ Reward image generation failed (attempt ${attempt}/${maxAttempts}):`, error.message);
      
      if (attempt === maxAttempts) {
        console.log('   Continuing without image...');
        return null;
      }
    }
  }

  console.error('❌ All image generation attempts exhausted:', lastError?.message);
  console.log('   Continuing without image...');
  return null;
}

/**
 * Check if a girl profile has cached rewards
 * 
 * @param girlProfileId - UUID of the girl profile
 * @returns Cached rewards if available, null otherwise
 */
async function checkCachedRewards(
  girlProfileId: string
): Promise<RewardGenerationResult | null> {
  console.log(`🔍 Checking for cached rewards for girl profile ${girlProfileId}...`);
  
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('girl_profiles')
    .select('reward_text, reward_voice_url, reward_image_url, reward_description, rewards_generated')
    .eq('id', girlProfileId)
    .single();

  if (error) {
    console.error('   Error checking cached rewards:', error);
    return null;
  }

  if (!data?.rewards_generated || !data.reward_text) {
    console.log('   No cached rewards found');
    return null;
  }

  console.log('   ✓ Found cached rewards!');
  console.log(`      Text: ${data.reward_text.substring(0, 50)}...`);
  console.log(`      Voice: ${data.reward_voice_url ? 'available' : 'not available'}`);
  console.log(`      Image: ${data.reward_image_url ? 'available' : 'not available'}`);

  return {
    rewardText: data.reward_text,
    rewardVoiceUrl: data.reward_voice_url,
    rewardImageUrl: data.reward_image_url,
    generationTime: 0, // Cached, no generation time
    breakdown: {
      textGeneration: 0,
      voiceGeneration: 0,
      imageGeneration: 0,
    },
  };
}

/**
 * Cache generated rewards to girl profile for future reuse
 * 
 * @param girlProfileId - UUID of the girl profile
 * @param rewards - Generated reward data to cache
 */
async function cacheRewardsToProfile(
  girlProfileId: string,
  rewards: {
    reward_text: string;
    reward_voice_url: string | null;
    reward_image_url: string | null;
    reward_description: string;
  }
): Promise<void> {
  console.log(`💾 Caching rewards to girl profile ${girlProfileId}...`);
  
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('girl_profiles')
    .update({
      reward_text: rewards.reward_text,
      reward_voice_url: rewards.reward_voice_url,
      reward_image_url: rewards.reward_image_url,
      reward_description: rewards.reward_description,
      rewards_generated: true,
    })
    .eq('id', girlProfileId);

  if (error) {
    console.error('   ❌ Error caching rewards:', error);
    throw new Error(`Failed to cache rewards: ${error.message}`);
  }

  console.log('   ✓ Rewards cached successfully');
}

/**
 * Save reward data to rewards table for historical tracking
 * 
 * @param roundId - UUID of the game round
 * @param rewardData - Reward data to save
 */
async function saveRewardToHistory(
  roundId: string,
  rewardData: RewardGenerationResult
): Promise<void> {
  console.log(`📝 Saving reward to history for round ${roundId}...`);
  
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('rewards').insert({
    round_id: roundId,
    reward_text: rewardData.rewardText,
    reward_voice_url: rewardData.rewardVoiceUrl,
    reward_image_url: rewardData.rewardImageUrl,
    generation_time: rewardData.generationTime,
  });

  if (error) {
    console.error('   ❌ Error saving reward to history:', error);
    // Don't throw error here, as this is not critical
    // The reward generation itself succeeded
  } else {
    console.log('   ✓ Reward saved to history');
  }
}

/**
 * Generate complete reward (text, voice, image) in parallel
 * Main orchestrator function that coordinates all three asset generations
 * 
 * @param roundId - UUID of the won game round
 * @returns Complete reward generation result with all assets and timing
 */
export async function generateCompleteReward(
  roundId: string
): Promise<RewardGenerationResult> {
  const overallStartTime = Date.now();

  console.log(`🎁 Starting complete reward generation for round ${roundId}`);
  console.log(`================================================`);

  // Set initial status
  setRewardStatus(roundId, {
    status: 'generating',
    message: 'Generating reward...',
  });

  try {
    // Fetch round data from database (including girl_profile_id for caching)
    const supabase = await createClient();
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('girl_name, girl_description, girl_persona, girl_profile_id')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      setRewardStatus(roundId, {
        status: 'failed',
        message: 'Failed to fetch round data',
      });
      throw new Error(`Failed to fetch round data: ${roundError?.message || 'Round not found'}`);
    }

    const { girl_name, girl_description, girl_persona, girl_profile_id } = round;

    if (!girl_description) {
      setRewardStatus(roundId, {
        status: 'failed',
        message: 'Girl description is required for reward generation',
      });
      throw new Error('Girl description is required for reward generation');
    }

    // Check for cached rewards if round is linked to a girl profile
    if (girl_profile_id) {
      const cachedRewards = await checkCachedRewards(girl_profile_id);
      if (cachedRewards) {
        console.log('   🚀 Using cached rewards (fast path)');
        // Still save to rewards table for historical tracking
        await saveRewardToHistory(roundId, cachedRewards);
        
        const totalTime = (Date.now() - overallStartTime) / 1000;
        console.log(`\n================================================`);
        console.log(`✅ Cached rewards returned in ${totalTime.toFixed(2)}s`);
        
        setRewardStatus(roundId, {
          status: 'completed',
          message: 'Reward generated successfully (cached)',
        });
        
        return cachedRewards;
      }
    }

    console.log('   🔨 Generating new rewards (no cache available)');

    // Track timing for each asset
    const timings = {
      text: 0,
      voice: 0,
      image: 0,
    };

    // Step 1: Generate reward text (required, must succeed)
    const textStartTime = Date.now();
    const rewardText = await generateRewardText(girl_name, girl_persona || 'playful');
    timings.text = (Date.now() - textStartTime) / 1000;

    // Step 2 & 3: Generate voice and image in parallel (optional, can fail)
    console.log(`\n🔄 Starting parallel generation (voice + image)...`);

    const voiceStartTime = Date.now();
    const imageStartTime = Date.now();

    // Create a callback for image retry notifications
    const onImageRetry = (attempt: number, maxAttempts: number) => {
      setRewardStatus(roundId, {
        status: 'retrying',
        message: 'Re-trying reward generation',
        attempt,
        maxAttempts,
      });
    };

    const [voiceResult, imageResult] = await Promise.allSettled([
      generateRewardVoice(rewardText, roundId),
      generateRewardImage(girl_description, roundId, onImageRetry),
    ]);

    // Extract results
    const rewardVoiceUrl =
      voiceResult.status === 'fulfilled' ? voiceResult.value : null;
    const rewardImageUrl =
      imageResult.status === 'fulfilled' ? imageResult.value : null;

    timings.voice = (Date.now() - voiceStartTime) / 1000;
    timings.image = (Date.now() - imageStartTime) / 1000;

    const totalTime = (Date.now() - overallStartTime) / 1000;

    const rewardResult: RewardGenerationResult = {
      rewardText,
      rewardVoiceUrl,
      rewardImageUrl,
      generationTime: totalTime,
      breakdown: {
        textGeneration: timings.text,
        voiceGeneration: timings.voice,
        imageGeneration: timings.image,
      },
    };

    console.log(`\n================================================`);
    console.log(`✅ Complete reward generation finished`);
    console.log(`   Total time: ${totalTime.toFixed(2)}s`);
    console.log(`   Text: ${timings.text.toFixed(2)}s`);
    console.log(`   Voice: ${timings.voice.toFixed(2)}s (${rewardVoiceUrl ? 'success' : 'failed'})`);
    console.log(`   Image: ${timings.image.toFixed(2)}s (${rewardImageUrl ? 'success' : 'failed'})`);

    // If image generation failed completely (all 3 attempts), delete the girl profile
    // to prevent her from being selected again (her description triggers content filters)
    if (!rewardImageUrl && girl_profile_id) {
      console.log(`\n🗑️  Image generation failed completely - removing problematic girl profile`);
      console.log(`   Girl Profile ID: ${girl_profile_id}`);
      
      try {
        // Step 1: Fetch the girl profile to get file URLs before deletion
        const { data: girlProfile, error: fetchError } = await supabase
          .from('girl_profiles')
          .select('image_url, reward_image_url, reward_voice_url')
          .eq('id', girl_profile_id)
          .single();
        
        if (fetchError) {
          console.error('   ❌ Failed to fetch girl profile for cleanup:', fetchError);
        } else if (girlProfile) {
          // Step 2: Delete associated files from Supabase Storage
          const filesToDelete: string[] = [];
          
          // Extract file paths from URLs
          if (girlProfile.image_url) {
            const imagePath = girlProfile.image_url.split('/girl-images/')[1];
            if (imagePath) filesToDelete.push(`girl-images/${imagePath}`);
          }
          if (girlProfile.reward_image_url) {
            const rewardImgPath = girlProfile.reward_image_url.split('/reward-images/')[1];
            if (rewardImgPath) filesToDelete.push(`reward-images/${rewardImgPath}`);
          }
          if (girlProfile.reward_voice_url) {
            const rewardVoicePath = girlProfile.reward_voice_url.split('/reward-audio/')[1];
            if (rewardVoicePath) filesToDelete.push(`reward-audio/${rewardVoicePath}`);
          }
          
          // Delete files from storage
          if (filesToDelete.length > 0) {
            console.log(`   🗑️  Deleting ${filesToDelete.length} file(s) from storage...`);
            for (const filePath of filesToDelete) {
              const bucket = filePath.split('/')[0];
              const path = filePath.split('/').slice(1).join('/');
              
              const { error: storageError } = await supabase.storage
                .from(bucket)
                .remove([path]);
              
              if (storageError) {
                console.error(`   ⚠️  Failed to delete ${filePath}:`, storageError.message);
              } else {
                console.log(`   ✅ Deleted: ${filePath}`);
              }
            }
          }
        }
        
        // Step 3: Delete the girl profile from database
        const { error: deleteError } = await supabase
          .from('girl_profiles')
          .delete()
          .eq('id', girl_profile_id);
        
        if (deleteError) {
          console.error('   ❌ Failed to delete girl profile:', deleteError);
        } else {
          console.log(`   ✅ Successfully deleted girl profile and associated files`);
        }
      } catch (deleteErr) {
        console.error('   ❌ Error during cleanup:', deleteErr);
      }
    }

    // Cache rewards to girl profile if linked (for future reuse)
    // Only cache if image generation succeeded
    if (girl_profile_id && rewardImageUrl) {
      try {
        await cacheRewardsToProfile(girl_profile_id, {
          reward_text: rewardText,
          reward_voice_url: rewardVoiceUrl,
          reward_image_url: rewardImageUrl,
          reward_description: girl_description,
        });
      } catch (cacheError: any) {
        // Make error more visible - this is actually critical for performance!
        console.error('   🚨 CRITICAL: Failed to cache rewards to girl profile!');
        console.error('   Error:', cacheError.message);
        console.error('   Stack:', cacheError.stack);
        console.error('   Girl Profile ID:', girl_profile_id);
        // In development, throw to surface the issue immediately
        if (process.env.NODE_ENV === 'development') {
          console.error('   ⚠️  Would throw in dev mode (disabled to not break production)');
        }
      }
    } else if (girl_profile_id && !rewardImageUrl) {
      console.log('   ⚠️  Skipping reward cache - image generation failed (girl will be deleted)');
    } else {
      console.log('   ⚠️  No girl_profile_id - rewards will NOT be cached for reuse');
    }

    // Save to rewards table for historical tracking
    await saveRewardToHistory(roundId, rewardResult);

    setRewardStatus(roundId, {
      status: 'completed',
      message: 'Reward generated successfully',
    });

    return rewardResult;
  } catch (error) {
    setRewardStatus(roundId, {
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}


