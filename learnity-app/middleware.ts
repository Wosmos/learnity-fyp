/**
 * Next.js Middleware for Route Protection
 * Simplified middleware to avoid Firebase Admin SDK imports in client components
 */

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For now, let client-side protection handle admin routes
  // This avoids Firebase Admin SDK import issues
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Only match admin API routes for server-side protection
     */
    "/api/admin/:path*",
  ],
};
