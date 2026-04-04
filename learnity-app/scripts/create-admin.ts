/**
 * One-time admin setup script
 * Creates admin user in Firebase Auth + Neon DB with proper claims
 *
 * Usage: source ../.env.local && DATABASE_URL="$DATABASE_URL" bunx tsx scripts/create-admin.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.STATIC_ADMIN_EMAIL || 'admin@learnity.com';
const ADMIN_PASSWORD = process.env.STATIC_ADMIN_PASSWORD || 'admin123';

async function main() {
  console.log(`Setting up admin: ${ADMIN_EMAIL}`);

  // Init Firebase Admin
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  const auth = getAuth(app);

  // Create or get Firebase user
  let firebaseUser;
  try {
    firebaseUser = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log('Firebase user exists:', firebaseUser.uid);
  } catch {
    firebaseUser = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      emailVerified: true,
      displayName: 'Platform Admin',
    });
    console.log('Firebase user created:', firebaseUser.uid);
  }

  // Set admin custom claims
  await auth.setCustomUserClaims(firebaseUser.uid, {
    role: 'ADMIN',
    permissions: [
      'view:admin_panel',
      'manage:users',
      'approve:teachers',
      'view:audit_logs',
      'manage:platform',
    ],
    profileComplete: true,
    emailVerified: true,
  });
  console.log('Custom claims set');

  // Create or update DB profile
  const existing = await prisma.user.findUnique({
    where: { firebaseUid: firebaseUser.uid },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'ADMIN', emailVerified: true, isActive: true },
    });
    console.log('DB profile updated to ADMIN');
  } else {
    await prisma.user.create({
      data: {
        firebaseUid: firebaseUser.uid,
        email: ADMIN_EMAIL,
        firstName: 'Platform',
        lastName: 'Admin',
        role: 'ADMIN',
        emailVerified: true,
        isActive: true,
        authProvider: 'email',
      },
    });
    console.log('DB profile created');
  }

  await prisma.$disconnect();
  console.log('Done! Login with:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
}

main().catch(e => { console.error(e); process.exit(1); });
