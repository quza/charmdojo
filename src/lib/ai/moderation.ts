/**
 * Content Moderation Service
 * Handles offensive content detection and gibberish filtering using OpenAI Moderation API
 */

import OpenAI from 'openai';

// Instant fail reason constants
export const INSTANT_FAIL_REASONS = {
  OFFENSIVE: 'offensive',
  SEXUAL: 'explicitly_sexual',
  HARASSMENT: 'harassment',
  HATE: 'hate_speech',
  VIOLENCE: 'violence',
  GIBBERISH: 'gibberish',
  EMPTY: 'empty_message',
} as const;

export type InstantFailReason = typeof INSTANT_FAIL_REASONS[keyof typeof INSTANT_FAIL_REASONS];

export interface ModerationResult {
  isSafe: boolean;
  flagged: boolean;
  categories: {
    harassment?: boolean;
    'harassment/threatening'?: boolean;
    hate?: boolean;
    'hate/threatening'?: boolean;
    'self-harm'?: boolean;
    'self-harm/intent'?: boolean;
    'self-harm/instructions'?: boolean;
    sexual?: boolean;
    'sexual/minors'?: boolean;
    violence?: boolean;
    'violence/graphic'?: boolean;
  };
  failReason?: InstantFailReason;
  details?: string;
}

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
 * Calculate the entropy of a string to detect gibberish
 * Higher entropy = more random/gibberish
 */
function calculateEntropy(text: string): number {
  if (!text || text.length === 0) return 0;

  const frequencies: Record<string, number> = {};
  const length = text.length;

  // Count character frequencies
  for (const char of text) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  // Calculate entropy
  let entropy = 0;
  for (const char in frequencies) {
    const probability = frequencies[char] / length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Detect if a message is gibberish based on various heuristics
 */
function isGibberish(message: string): boolean {
  const trimmed = message.trim();

  // Check minimum length
  if (trimmed.length < 1) return true;

  // Very short messages (1-2 chars) are usually not gibberish unless they're just symbols
  if (trimmed.length <= 2) {
    return /^[^a-zA-Z0-9\s]+$/.test(trimmed);
  }

  // Calculate character entropy
  const entropy = calculateEntropy(trimmed);
  const maxEntropy = Math.log2(26); // Max entropy for English alphabet
  const normalizedEntropy = entropy / maxEntropy;

  // High entropy indicates random characters
  if (normalizedEntropy > 0.95) return true;

  // Check for excessive repeated characters (e.g., "aaaaaaaa", "hahahaha" is ok but "asdfasdfasdf" isn't)
  const repeatedPattern = /(.)\1{7,}/;
  if (repeatedPattern.test(trimmed)) return true;

  // Check for excessive random character sequences (keyboard mashing)
  const randomSequencePattern = /[qwfpgjluy]{5,}|[asdrtzxcvbn]{5,}|[zxcvbnm]{5,}/i;
  if (randomSequencePattern.test(trimmed) && !/\b(qwerty|asdf|zxcv)\b/i.test(trimmed)) {
    // Allow common keyboard-related words but flag actual mashing
    const words = trimmed.toLowerCase().split(/\s+/);
    const gibberishWords = words.filter(word => 
      word.length > 4 && randomSequencePattern.test(word)
    );
    if (gibberishWords.length / words.length > 0.5) return true;
  }

  // Check ratio of consonants to vowels (English text usually has good balance)
  const consonants = (trimmed.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
  const vowels = (trimmed.match(/[aeiou]/gi) || []).length;
  const letters = consonants + vowels;

  if (letters > 5) {
    const vowelRatio = vowels / letters;
    // English typically has 37-40% vowels, flag if too low
    if (vowelRatio < 0.15 && consonants > 8) return true;
  }

  // Check for excessive special characters
  const specialChars = (trimmed.match(/[^a-zA-Z0-9\s.,!?'"]/g) || []).length;
  const specialCharRatio = specialChars / trimmed.length;
  if (specialCharRatio > 0.4 && trimmed.length > 5) return true;

  return false;
}

/**
 * Check message safety using OpenAI Moderation API and custom heuristics
 * @param message - User's message to check
 * @returns ModerationResult with safety status and details
 */
export async function checkMessageSafety(message: string): Promise<ModerationResult> {
  const trimmed = message.trim();

  // Check for empty message
  if (!trimmed || trimmed.length === 0) {
    return {
      isSafe: false,
      flagged: true,
      categories: {},
      failReason: INSTANT_FAIL_REASONS.EMPTY,
      details: 'Message is empty',
    };
  }

  // Check for gibberish
  if (isGibberish(trimmed)) {
    return {
      isSafe: false,
      flagged: true,
      categories: {},
      failReason: INSTANT_FAIL_REASONS.GIBBERISH,
      details: 'Message appears to be nonsense or gibberish',
    };
  }

  try {
    // Call OpenAI Moderation API
    const openai = getOpenAIClient();
    const moderation = await openai.moderations.create({
      input: trimmed,
    });

    const result = moderation.results[0];

    // Check if content is flagged
    if (result.flagged) {
      const categories = result.categories;
      
      // Determine the specific fail reason based on flagged categories
      let failReason: InstantFailReason = INSTANT_FAIL_REASONS.OFFENSIVE;
      let details = 'Content flagged by moderation system';

      if (categories.harassment || categories['harassment/threatening']) {
        failReason = INSTANT_FAIL_REASONS.HARASSMENT;
        details = 'Harassment or threatening language detected';
      } else if (categories.hate || categories['hate/threatening']) {
        failReason = INSTANT_FAIL_REASONS.HATE;
        details = 'Hate speech detected';
      } else if (categories.sexual || categories['sexual/minors']) {
        failReason = INSTANT_FAIL_REASONS.SEXUAL;
        details = 'Explicitly sexual or inappropriate content detected';
      } else if (categories.violence || categories['violence/graphic']) {
        failReason = INSTANT_FAIL_REASONS.VIOLENCE;
        details = 'Violent or graphic content detected';
      }

      return {
        isSafe: false,
        flagged: true,
        categories: result.categories,
        failReason,
        details,
      };
    }

    // Content is safe
    return {
      isSafe: true,
      flagged: false,
      categories: result.categories,
    };

  } catch (error: any) {
    console.error('Error during moderation check:', error);
    
    // On API error, be permissive but log the error
    // Better to allow a message through than to false-positive fail
    console.warn('Moderation API failed, allowing message through:', error.message);
    
    return {
      isSafe: true,
      flagged: false,
      categories: {},
    };
  }
}

/**
 * Check if a message should cause an instant fail
 * Convenience function that returns just the boolean
 */
export async function shouldInstantFail(message: string): Promise<boolean> {
  const result = await checkMessageSafety(message);
  return !result.isSafe;
}



