/**
 * Next.js Middleware for Route Protection
 * Role-based authorization for protected routes
 */

import { NextRequest, NextResponse } from "next/server";

// Define route access rules
const ROUTE_RULES = {
  // Student-only routes
  student: [
    '/dashboard/student',
    '/profile/enhance',
    '/courses/enroll',
  ],
  // Teacher-only routes
  teacher: [
    '/dashboard/teacher',
    '/dashboard/teacher/students',
    '/dashboard/teacher/applications',
  ],
  // Admin-only routes
  admin: [
    '/dashboard/admin',
    '/admin',
  ],
  // Public routes (no auth required)
  public: [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/demo',
    '/welcome',
  ],
  // Protected routes (any authenticated user)
  protected: [
    '/dashboard',
    '/profile',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (ROUTE_RULES.public.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For API routes, let the API handlers manage auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For protected routes, check if user has session cookie
  // The actual role verification happens client-side with useClientAuth
  const hasSession = request.cookies.has('session') || 
                     request.cookies.has('__session');

  if (!hasSession) {
    // Redirect to login if no session
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  // Client-side auth hooks will handle role-specific redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
