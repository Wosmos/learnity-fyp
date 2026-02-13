/**
 * Admin Seed Script
 * Creates a default admin user in both Firebase Auth and the Database
 * Run with: bun run prisma/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import { adminAuth } from '../src/lib/config/firebase-admin';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin.learnity@yopmail.com';
  const password = 'password123';
  const firstName = 'Super';
  const lastName = 'Admin';

  console.log(`🚀 Starting admin seed for: ${email}`);

  try {
    // 1. Ensure User in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
      console.log('✅ User already exists in Firebase Auth.');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: true,
        });
        console.log('✅ Created new user in Firebase Auth.');
      } else {
        throw error;
      }
    }

    // 2. Set Firebase Custom Claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: 'ADMIN',
      permissions: [
        'VIEW_ADMIN_PANEL',
        'MANAGE_USERS',
        'APPROVE_TEACHERS',
        'VIEW_AUDIT_LOGS',
        'MANAGE_PLATFORM',
      ],
      profileComplete: true,
      emailVerified: true,
    });
    console.log('✅ Set Firebase custom claims for ADMIN role.');

    // 3. Sync with Database
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firebaseUid: userRecord.uid,
        firstName,
        lastName,
        role: 'ADMIN',
        emailVerified: true,
      },
      create: {
        firebaseUid: userRecord.uid,
        email,
        firstName,
        lastName,
        role: 'ADMIN',
        emailVerified: true,
        adminProfile: {
          create: {
            department: 'Platform Management',
            isStatic: true,
          },
        },
      },
    });
    console.log(`✅ Database profile synced. ID: ${user.id}`);

    console.log('\n✨ Admin account is ready!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\n💡 Please log in with these credentials.');
  } catch (error) {
    console.error('❌ Admin seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
