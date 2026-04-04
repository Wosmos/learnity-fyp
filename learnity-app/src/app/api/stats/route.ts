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

    // Return honest fallback on error
    return NextResponse.json({
      activeLearners: '—',
      expertTutors: '—',
      averageRating: '—',
    });
  }
}

// On-demand revalidation via cache tags — no TTL
