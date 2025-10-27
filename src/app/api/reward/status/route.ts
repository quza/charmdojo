/**
 * GET /api/reward/status?roundId=xxx
 * Get the current status of a reward generation in progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRewardStatus } from '@/lib/services/reward-status';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roundId = searchParams.get('roundId');

    if (!roundId) {
      return NextResponse.json(
        { 
          error: 'missing_round_id',
          message: 'Round ID is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const status = getRewardStatus(roundId);

    if (!status) {
      return NextResponse.json(
        { 
          status: 'unknown',
          message: 'No status available for this round',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(status, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error fetching reward status:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

