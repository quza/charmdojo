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
    placeholdersUsed: number;
    failedGenerations: number;
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
