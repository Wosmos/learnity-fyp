/**
 * Platform Statistics API Route
 * Returns real-time platform statistics
 */

import { NextResponse } from 'next/server';
import { getPlatformStats, formatStatValue } from '@/lib/data/stats';

export async function GET() {
  try {
    const stats = await getPlatformStats();

    return NextResponse.json({
      activeLearners: formatStatValue(stats.activeLearners),
      expertTutors: formatStatValue(stats.expertTutors),
      averageRating: stats.averageRating,
    });
  } catch (error) {
    console.error('Error in stats API:', error);

    // Return fallback values on error
    return NextResponse.json({
      activeLearners: '1,000+',
      expertTutors: '500+',
      averageRating: '4.9',
    });
  }
}

// Cache for 5 minutes
export const revalidate = 300;
