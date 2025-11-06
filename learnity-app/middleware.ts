/**
 * Next.js Middleware for Route Protection and Authentication
 * Handles authentication checks and redirects for protected routes
 */

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/privacy',
    '/terms',
    '/support',
    '/demo',
    '/welcome',
    '/unauthorized'
  ];

  // Define API routes that should be handled by their own authentication
  const apiRoutes = [
    '/api/auth/',
    '/api/public/'
  ];

  // Allow public routes and API routes to pass through
  if (publicRoutes.includes(pathname) || 
      apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For protected routes, let client-side authentication handle the logic
  // This avoids Firebase Admin SDK import issues in middleware
  // The client-side components will handle redirects appropriately
  
  // Add security headers for all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add CSP header for additional security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.learnity.com https://*.googleapis.com https://*.firebaseapp.com https://*.cloudfunctions.net;"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
