/**
 * Next.js Middleware for Route Protection
 * Integrates with the authentication middleware for automatic route protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { routeProtectionMiddleware } from '@/lib/middleware/auth.middleware';

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes that don't need protection
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'
  ) {
    return NextResponse.next();
  }

  try {
    // Apply route protection
    const response = await routeProtectionMiddleware(request);
    
    if (response) {
      return response;
    }

    // Continue to the next middleware or route handler
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Redirect to login on middleware errors
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};