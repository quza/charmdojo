/**
 * POST /api/game/generate-girls
 * 
 * Generate 3 diverse girl profiles with AI-generated images
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-utils';
import { generateGirlProfiles } from '@/lib/utils/girl-generator';
import { generateMultipleGirlImages } from '@/lib/services/girl-image-service';
import type { GenerateGirlsResponse, Girl } from '@/types/game';

// Rate limiting map (in-memory, production should use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Environment-based rate limiting
const isDevelopment = process.env.NODE_ENV === 'development';
const RATE_LIMIT_WINDOW = isDevelopment ? 60 * 1000 : 2 * 60 * 1000; // 1 min dev, 2 min prod
const MAX_REQUESTS_PER_WINDOW = isDevelopment ? 20 : 10; // More generous limits

/**
 * Check rate limit for a user
 * @returns { allowed: boolean; resetAt?: number; remaining?: number }
 */
function checkRateLimit(userId: string): { 
  allowed: boolean; 
  resetAt: number; 
  remaining: number;
} {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or initialize
    const resetAt = now + RATE_LIMIT_WINDOW;
    rateLimitMap.set(userId, {
      count: 1,
      resetAt,
    });
    return {
      allowed: true,
      resetAt,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
    };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      resetAt: userLimit.resetAt,
      remaining: 0,
    };
  }

  userLimit.count += 1;
  
  return {
    allowed: true,
    resetAt: userLimit.resetAt,
    remaining: MAX_REQUESTS_PER_WINDOW - userLimit.count,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Step 2: Check rate limit
    const rateLimit = checkRateLimit(user.id);
    
    if (!rateLimit.allowed) {
      const secondsUntilReset = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      const minutesUntilReset = Math.ceil(secondsUntilReset / 60);
      
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Too many generation requests. Please wait ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''} before trying again.`,
          resetAt: rateLimit.resetAt,
          secondsUntilReset,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': secondsUntilReset.toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          }
        }
      );
    }

    console.log(`\n🎮 Generating girls for user: ${user.email}`);

    // Step 3: Generate girl profiles with attributes
    const generatedGirls = generateGirlProfiles(3);
    console.log(`✓ Generated ${generatedGirls.length} girl profiles with attributes`);

    // Step 4: Generate images in parallel
    const imageResults = await generateMultipleGirlImages(generatedGirls);

    // Step 5: Build Girl objects with image URLs
    const girls: Girl[] = generatedGirls.map((girl, index) => {
      const imageResult = imageResults[index];
      
      return {
        id: `girl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: girl.name,
        imageUrl: imageResult.imageUrl || '', // Empty string if failed
        attributes: girl.attributes,
      };
    });

    // Filter out girls with failed image generation
    const successfulGirls = girls.filter(g => g.imageUrl !== '');

    if (successfulGirls.length === 0) {
      return NextResponse.json(
        {
          error: 'generation_failed',
          message: 'Failed to generate any girl profiles. Please try again.',
        },
        { status: 500 }
      );
    }

    // Calculate metadata
    const totalTime = (Date.now() - startTime) / 1000;
    const placeholdersUsed = imageResults.filter(r => r.usedPlaceholder).length;
    const failedGenerations = imageResults.filter(r => !r.success).length;

    const response: GenerateGirlsResponse = {
      success: true,
      girls: successfulGirls,
      metadata: {
        totalTime,
        placeholdersUsed,
        failedGenerations,
      },
    };

    console.log(`✅ API response ready (${totalTime.toFixed(2)}s)`);
    console.log(`   Successful: ${successfulGirls.length}/${generatedGirls.length}`);
    console.log(`   Placeholders: ${placeholdersUsed}`);
    console.log('');

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      }
    });
  } catch (error) {
    console.error('❌ Error in generate-girls API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to generate girl profiles',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

