/**
 * Model Router Stats API
 * 
 * Provides insights into model selection patterns, performance metrics,
 * and routing statistics for transparency and optimization.
 */

import { NextResponse } from 'next/server';
import { modelRouter } from '@/lib/modelRouter';

export async function GET() {
  try {
    const stats = await modelRouter.getRoutingStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch routing stats' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to trigger model discovery
 */
export async function POST() {
  try {
    await modelRouter.discoverNewModels();
    
    return NextResponse.json({
      success: true,
      message: 'Model discovery completed'
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to discover models' 
      },
      { status: 500 }
    );
  }
}