/**
 * POST /api/game/start-round
 * 
 * Start a new conversation round with selected girl
 * Generates detailed description using Vision API for later reward generation
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-utils';
import { createClient } from '@/lib/supabase/server';
import { generateGirlDescriptionWithFallback } from '@/lib/ai/openai';
import type { Girl } from '@/types/game';

interface StartRoundRequest {
  girlId: string;
  girlData: Girl;
}

interface StartRoundResponse {
  roundId: string;
  girl: {
    name: string;
    imageUrl: string;
    description: string;
    persona: string;
  };
  successMeter: number;
  conversationHistory: [];
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

    // Step 2: Parse and validate request
    const body: StartRoundRequest = await request.json();
    const { girlId, girlData } = body;

    if (!girlId || !girlData) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Missing required fields: girlId and girlData',
        },
        { status: 400 }
      );
    }

    if (!girlData.imageUrl || !girlData.name || !girlData.attributes) {
      return NextResponse.json(
        {
          error: 'invalid_girl_data',
          message: 'Girl data must include imageUrl, name, and attributes',
        },
        { status: 400 }
      );
    }

    console.log(`\n🎮 Starting round for user: ${user.email}`);
    console.log(`   Selected girl: ${girlData.name}`);

    // Step 3: Generate detailed girl description using Vision API
    console.log('📸 Generating girl description...');
    const descriptionStartTime = Date.now();
    
    const { description, usedFallback } = await generateGirlDescriptionWithFallback(
      girlData.imageUrl,
      girlData.attributes
    );

    const descriptionTime = (Date.now() - descriptionStartTime) / 1000;
    console.log(`✓ Description generated in ${descriptionTime.toFixed(2)}s (${usedFallback ? 'fallback' : 'Vision API'})`);

    // Step 4: Assign persona (default: playful for now)
    const persona = 'playful';

    // Step 5: Create game round in database
    const supabase = await createClient();
    
    const { data: round, error: dbError } = await supabase
      .from('game_rounds')
      .insert({
        user_id: user.id,
        girl_name: girlData.name,
        girl_image_url: girlData.imageUrl,
        girl_description: description,
        girl_persona: persona,
        initial_meter: 20,
        message_count: 0,
      })
      .select()
      .single();

    if (dbError || !round) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json(
        {
          error: 'database_error',
          message: 'Failed to create game round',
          details: dbError?.message,
        },
        { status: 500 }
      );
    }

    console.log(`✓ Round created: ${round.id}`);

    // Step 6: Build response
    const totalTime = (Date.now() - startTime) / 1000;
    
    const response: StartRoundResponse = {
      roundId: round.id,
      girl: {
        name: girlData.name,
        imageUrl: girlData.imageUrl,
        description: description,
        persona: persona,
      },
      successMeter: 20,
      conversationHistory: [],
    };

    console.log(`✅ Round started successfully (${totalTime.toFixed(2)}s)`);
    console.log('');

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('❌ Error in start-round API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to start game round',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

