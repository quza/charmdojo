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
import { createClient } from '@/lib/supabase/server';

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
 * @returns Public URL of uploaded image, or null if failed
 */
async function generateRewardImage(
  girlDescription: string,
  roundId: string
): Promise<string | null> {
  try {
    console.log(`📸 Generating reward image...`);

    // Load and substitute prompt
    const promptTemplate = loadRewardPhotoPrompt();
    const prompt = promptTemplate.replace('<girl-description>', girlDescription);

    // Validate prompt substitution
    if (prompt.includes('<girl-description>')) {
      throw new Error('Failed to substitute girl description in prompt');
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
    console.error('❌ Reward image generation failed:', error.message);
    console.log('   Continuing without image...');
    return null;
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

  // Fetch round data from database
  const supabase = await createClient();
  const { data: round, error: roundError } = await supabase
    .from('game_rounds')
    .select('girl_name, girl_description, girl_persona')
    .eq('id', roundId)
    .single();

  if (roundError || !round) {
    throw new Error(`Failed to fetch round data: ${roundError?.message || 'Round not found'}`);
  }

  const { girl_name, girl_description, girl_persona } = round;

  if (!girl_description) {
    throw new Error('Girl description is required for reward generation');
  }

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

  const [voiceResult, imageResult] = await Promise.allSettled([
    generateRewardVoice(rewardText, roundId),
    generateRewardImage(girl_description, roundId),
  ]);

  // Extract results
  const rewardVoiceUrl =
    voiceResult.status === 'fulfilled' ? voiceResult.value : null;
  const rewardImageUrl =
    imageResult.status === 'fulfilled' ? imageResult.value : null;

  timings.voice = (Date.now() - voiceStartTime) / 1000;
  timings.image = (Date.now() - imageStartTime) / 1000;

  const totalTime = (Date.now() - overallStartTime) / 1000;

  console.log(`\n================================================`);
  console.log(`✅ Complete reward generation finished`);
  console.log(`   Total time: ${totalTime.toFixed(2)}s`);
  console.log(`   Text: ${timings.text.toFixed(2)}s`);
  console.log(`   Voice: ${timings.voice.toFixed(2)}s (${rewardVoiceUrl ? 'success' : 'failed'})`);
  console.log(`   Image: ${timings.image.toFixed(2)}s (${rewardImageUrl ? 'success' : 'failed'})`);

  return {
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
}


