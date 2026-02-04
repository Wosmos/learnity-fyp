import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * API route to trigger on-demand revalidation of user cache
 * This is called after user actions like approving a teacher or suspending a user
 */
export async function POST(request: NextRequest) {
  try {
    // In a real app, you would verify an admin token here or a secret key
    // For simplicity, we'll assume it's protected by other means or internal only

    (revalidateTag as any)('users');
    (revalidateTag as any)('user-management');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tags: ['users', 'user-management'],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}
