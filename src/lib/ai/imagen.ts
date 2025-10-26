/**
 * Google Imagen 4 Fast API Client
 * Generates images using Vertex AI
 */

import { GoogleAuth } from 'google-auth-library';
import { withRetry } from '@/lib/utils/retry';

interface ImagenGenerationParams {
  prompt: string;
  sampleCount?: number; // 1-4 images
  aspectRatio?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3';
}

interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded?: string;
    mimeType?: string;
    raiFilteredReason?: string; // Google's Responsible AI content filter reason
    [key: string]: any; // Allow other fields from API response
  }>;
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
  buffer: Buffer;
}

/**
 * Get authenticated Google Cloud access token
 */
async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  if (!tokenResponse.token) {
    throw new Error('Failed to obtain Google Cloud access token');
  }

  return tokenResponse.token;
}

/**
 * Generate images using Imagen 4 Fast
 */
export async function generateImage(
  params: ImagenGenerationParams
): Promise<GeneratedImage[]> {
  const {
    prompt,
    sampleCount = 1,
    aspectRatio = '3:4',
  } = params;

  // Validate environment variables
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'europe-central2';
  const modelId = process.env.IMAGEN_MODEL_ID || 'imagen-4.0-fast-generate-001';

  if (!projectId) {
    throw new Error('Missing GOOGLE_CLOUD_PROJECT_ID in environment');
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS in environment');
  }

  console.log(`🎨 Generating ${sampleCount} image(s) with Imagen 4 Fast...`);
  console.log(`📍 Location: ${location}, Model: ${modelId}`);

  // Get access token
  const accessToken = await getAccessToken();

  // Construct Vertex AI endpoint
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;

  // Request body
  const requestBody = {
    instances: [
      {
        prompt: prompt,
      },
    ],
    parameters: {
      sampleCount: Math.min(Math.max(sampleCount, 1), 4),
      aspectRatio: aspectRatio,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Imagen API Error Response:', errorText);
      throw new Error(
        `Imagen API failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data: ImagenResponse = await response.json();

    console.log(`✅ Imagen API returned ${data.predictions.length} prediction(s)`);

    // Validate predictions have required data
    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No predictions returned from Imagen API');
    }

    // Log first prediction structure for debugging
    if (data.predictions[0]) {
      console.log('📦 First prediction keys:', Object.keys(data.predictions[0]));
    }

    // Check for content filtering by Google's RAI (Responsible AI)
    const firstPrediction = data.predictions[0];
    if (firstPrediction.raiFilteredReason) {
      console.warn('🚫 Content filtered by Google Responsible AI:');
      console.warn(`   Reason: ${firstPrediction.raiFilteredReason}`);
      throw new Error(`Content filtered: ${firstPrediction.raiFilteredReason}`);
    }

    // Convert base64 to buffer with validation
    const images: GeneratedImage[] = data.predictions
      .filter((prediction, idx) => {
        if (!prediction.bytesBase64Encoded) {
          console.warn(`⚠️ Prediction ${idx} missing bytesBase64Encoded`);
          console.warn('   Available fields:', Object.keys(prediction));
          return false;
        }
        return true;
      })
      .map((prediction) => ({
        base64: prediction.bytesBase64Encoded!,
        mimeType: prediction.mimeType || 'image/png',
        buffer: Buffer.from(prediction.bytesBase64Encoded!, 'base64'),
      }));

    if (images.length === 0) {
      console.error('❌ No valid predictions with bytesBase64Encoded field');
      console.error('   Response structure:', JSON.stringify(data, null, 2).substring(0, 500));
      throw new Error('No valid images in API response (missing base64 data)');
    }

    console.log(`✅ Successfully processed ${images.length} image(s)`);
    return images;
  } catch (error) {
    console.error('❌ Error generating image:', error);
    throw error;
  }
}

/**
 * Generate image with automatic retry on failure
 * Uses intelligent retry logic with exponential backoff
 */
export async function generateImageWithRetry(
  params: ImagenGenerationParams,
  maxRetries = 3
): Promise<GeneratedImage[]> {
  return withRetry(
    () => generateImage(params),
    {
      maxAttempts: maxRetries,
      initialDelay: 1000,
      maxDelay: 8000,
      backoffMultiplier: 2,
      onRetry: (error, attempt) => {
        console.warn(`🔄 Imagen retry attempt ${attempt}: ${error.message}`);
      }
    }
  );
}
