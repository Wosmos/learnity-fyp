import { cookies } from 'next/headers';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/config/firebase-admin';

/**
 * Get the authenticated user in server components/actions.
 * Reads the session cookie, verifies the Firebase token, and returns the DB user.
 * Cached per-request via React.cache() so multiple calls in one render are free.
 *
 * Returns null if not authenticated (no redirect — caller decides what to do).
 */
export const getServerUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value || cookieStore.get('__session')?.value;

    if (!session) return null;

    // Verify token with Firebase Admin SDK (proper cryptographic verification)
    const decoded = await adminAuth.verifyIdToken(session);
    if (!decoded.uid) return null;

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        isActive: true,
        emailVerified: true,
      },
    });

    return user;
  } catch {
    return null;
  }
});

/**
 * Require authenticated user — throws redirect if not authenticated.
 * Use in server components where auth is mandatory.
 */
export async function requireServerUser() {
  const user = await getServerUser();
  if (!user) {
    // Dynamic import to avoid pulling next/navigation into every file
    const { redirect } = await import('next/navigation');
    redirect('/auth/login');
    // redirect() throws, so this is unreachable, but helps TS narrow the type
  }
  return user as NonNullable<typeof user>;
}
