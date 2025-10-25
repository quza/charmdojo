/**
 * Google Imagen 4 Fast API Client
 * Generates images using Vertex AI
 */

import { GoogleAuth } from 'google-auth-library';

interface ImagenGenerationParams {
  prompt: string;
  sampleCount?: number; // 1-4 images
  aspectRatio?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3';
}

interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
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

    console.log(`✅ Successfully generated ${data.predictions.length} image(s)`);

    // Validate predictions have required data
    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No predictions returned from Imagen API');
    }

    // Convert base64 to buffer with validation
    const images: GeneratedImage[] = data.predictions
      .filter((prediction) => {
        if (!prediction.bytesBase64Encoded) {
          console.warn('⚠️ Prediction missing bytesBase64Encoded, skipping');
          return false;
        }
        return true;
      })
      .map((prediction) => ({
        base64: prediction.bytesBase64Encoded,
        mimeType: prediction.mimeType,
        buffer: Buffer.from(prediction.bytesBase64Encoded, 'base64'),
      }));

    if (images.length === 0) {
      throw new Error('No valid images in API response (missing base64 data)');
    }

    return images;
  } catch (error) {
    console.error('❌ Error generating image:', error);
    throw error;
  }
}

/**
 * Generate image with automatic retry on failure
 */
export async function generateImageWithRetry(
  params: ImagenGenerationParams,
  maxRetries = 3
): Promise<GeneratedImage[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateImage(params);
    } catch (error) {
      lastError = error as Error;
      console.error(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}
