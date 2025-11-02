/**
 * API Route: Validate Route Access
 * Checks if user can access a specific route
 */

import { NextRequest, NextResponse } from 'next/server';
import { roleManager } from '@/lib/services/role-manager.service';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(false);
    }

    const idToken = authHeader.split('Bearer ')[1];
    const { searchParams } = new URL(request.url);
    const route = searchParams.get('route');

    if (!route) {
      return NextResponse.json(false);
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Validate route access
    const hasAccess = await roleManager.validateRouteAccess(uid, route);

    return NextResponse.json(hasAccess);
  } catch (error: any) {
    console.error('Failed to validate route access:', error);
    return NextResponse.json(false);
  }
}