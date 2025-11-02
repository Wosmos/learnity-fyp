/**
 * API Route: Get User Claims
 * Returns custom claims for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { roleManager } from '@/lib/services/role-manager.service';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get custom claims
    const claims = await roleManager.getCustomClaims(uid);

    return NextResponse.json(claims);
  } catch (error: any) {
    console.error('Failed to get user claims:', error);
    return NextResponse.json(
      { error: 'Failed to get user claims' },
      { status: 500 }
    );
  }
}