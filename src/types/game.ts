/**
 * Game-related type definitions for CharmDojo
 */

export interface GirlAttributes {
  ethnicity: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  hairstyle: string;
  setting: string;
}

export interface Girl {
  id: string;
  name: string;
  imageUrl: string;
  attributes: GirlAttributes;
  age: number; // Age generated once (19-28)
  description?: string;
  persona?: string;
}

export interface GeneratedGirl {
  name: string;
  attributes: GirlAttributes;
}

/**
 * Error types for image generation
 */
export type ImageGenerationError = 
  | 'imagen_api_error'
  | 'storage_upload_error'
  | 'prompt_validation_error'
  | 'unknown_error';

/**
 * Response from generate-girls API endpoint
 */
export interface GenerateGirlsResponse {
  success: boolean;
  girls: Girl[];
  metadata: {
    totalTime: number;
    poolSize: number;
    poolMode: boolean;
    placeholdersUsed?: number;
    failedGenerations?: number;
  };
  error?: string;
}

/**
 * Error response from API endpoints
 */
export interface APIError {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Vision API response for girl description generation
 */
export interface VisionAPIResponse {
  description: string;
  tokensUsed?: number;
  generationTime: number;
  usedFallback: boolean;
}

/**
 * Options for description generation
 */
export interface DescriptionGenerationOptions {
  timeout?: number; // milliseconds, default: 10000
  maxTokens?: number; // default: 500
  fallbackEnabled?: boolean; // default: true
}
