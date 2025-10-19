import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ur', 'sd'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export default withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true;
        }
        
        // Require token for protected routes
        if (req.nextUrl.pathname.startsWith('/dashboard') || 
            req.nextUrl.pathname.startsWith('/student') ||
            req.nextUrl.pathname.startsWith('/teacher') ||
            req.nextUrl.pathname.startsWith('/admin')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\.).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};