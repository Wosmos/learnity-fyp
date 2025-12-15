import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    // Verify the ID token to ensure it's valid before setting cookie
    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (verifyError) {
      console.error('Available token verification failed:', verifyError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Set the session cookie
    // We store the ID token directly to match middleware expectations
    const maxAge = 7 * 24 * 60 * 60; // 1 week
    const cookieParts = [
      `session=${encodeURIComponent(idToken)}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      `Max-Age=${maxAge}`
    ];
    
    if (process.env.NODE_ENV === 'production') {
      cookieParts.push('Secure');
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', cookieParts.join('; '));

    return response;
  } catch (error: any) {
    console.error('Session creation failed:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
