/**
 * ElevenLabs API Client
 * Handles text-to-speech voice generation with seductive voice
 */

import { withRetry } from '@/lib/utils/retry';

// Lazy initialization of API config
let apiKey: string | null = null;
let voiceId: string | null = null;
let modelId: string | null = null;

function getElevenLabsConfig() {
  if (!apiKey) {
    apiKey = process.env.ELEVENLABS_API_KEY;
    voiceId = process.env.ELEVENLABS_VOICE_ID;
    modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1';

    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }
    if (!voiceId) {
      throw new Error('ELEVENLABS_VOICE_ID environment variable is not set');
    }
  }

  return { apiKey, voiceId, modelId };
}

/**
 * Generate voice audio from text using ElevenLabs TTS
 * Automatically prepends [orgasmic] tag for sexy voice generation
 * 
 * @param text - Text to convert to speech (10-500 characters recommended)
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Audio buffer (MP3 format)
 */
export async function generateVoice(
  text: string,
  timeout: number = 30000
): Promise<Buffer> {
  return withRetry(
    async () => {
      const { apiKey, voiceId, modelId } = getElevenLabsConfig();

      // Prepend [orgasmic] tag for seductive voice
      const enhancedText = `[orgasmic]${text}`;

      console.log(`🎤 Generating voice with ElevenLabs...`);
      console.log(`   Voice ID: ${voiceId}`);
      console.log(`   Model: ${modelId}`);
      console.log(`   Text length: ${text.length} chars`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Call ElevenLabs TTS API
        const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey!,
          },
          body: JSON.stringify({
            text: enhancedText,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ElevenLabs API Error Response:', errorText);
          throw new Error(
            `ElevenLabs API failed: ${response.status} ${response.statusText}\n${errorText}`
          );
        }

        // Get audio buffer
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        if (audioBuffer.length === 0) {
          throw new Error('Empty audio buffer received from ElevenLabs');
        }

        console.log(`✅ Voice generated (${(audioBuffer.length / 1024).toFixed(2)} KB)`);

        return audioBuffer;
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new Error(`ElevenLabs API timeout after ${timeout}ms`);
        }

        throw error;
      }
    },
    {
      maxAttempts: 3,
      delayMs: 1000,
      onRetry: (attempt, error) => {
        console.warn(`⚠️  Voice generation attempt ${attempt} failed:`, error.message);
        console.log(`   Retrying...`);
      },
    }
  );
}

/**
 * Validate text before sending to ElevenLabs
 * @param text - Text to validate
 * @returns true if valid, throws error otherwise
 */
export function validateTextForVoice(text: string): boolean {
  if (!text || typeof text !== 'string') {
    throw new Error('Text must be a non-empty string');
  }

  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Text cannot be empty or whitespace only');
  }

  if (trimmed.length > 5000) {
    throw new Error('Text too long (max 5000 characters)');
  }

  return true;
}



