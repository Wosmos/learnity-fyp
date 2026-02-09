/**
 * Cleanup Script - Full System Wipe
 * 1. Cleans up Firebase Auth
 * 2. Cleans up Database (Neon DB)
 *
 * Run with: bun run prisma/cleanup-firebase-users.ts
 * Or: npx tsx prisma/cleanup-firebase-users.ts
 */

import { PrismaClient } from '@prisma/client';
import { deleteAllFirebaseUsers } from './firebase-cleanup';

const prisma = new PrismaClient();

async function deleteAllDatabaseData() {
  console.log('🗑️  Starting Database cleanup...\n');

  try {
    // Delete in order to satisfy foreign key constraints

    console.log('   1. Deleting Gamification Data...');
    await prisma.userQuest.deleteMany({});
    await prisma.userBadge.deleteMany({});
    await prisma.xPActivity.deleteMany({});
    await prisma.userProgress.deleteMany({});
    await prisma.badge.deleteMany({});

    console.log('   2. Deleting Course Progress & Reviews...');
    await prisma.lessonProgress.deleteMany({});
    await prisma.quizAttempt.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.certificate.deleteMany({});

    console.log('   3. Deleting Communication & Session Data...');
    // await prisma.sessionNotification.deleteMany({});
    // await prisma.deviceToken.deleteMany({});
    // await prisma.videoSessionParticipant.deleteMany({});
    // await prisma.videoSession.deleteMany({});
    // await prisma.teacherGroupChatMember.deleteMany({});
    // await prisma.teacherGroupChat.deleteMany({});
    await prisma.directMessageChannel.deleteMany({});

    console.log('   4. Deleting Live Session Data...');
    await prisma.liveSession.deleteMany({});
    await prisma.courseRoom.deleteMany({});

    console.log('   5. Deleting Course Content...');
    await prisma.question.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.category.deleteMany({});

    console.log('   6. Deleting Admin Action & Testimonials...');
    await prisma.adminAction.deleteMany({});
    await prisma.testimonial.deleteMany({});

    console.log('   7. Deleting System Logs...');
    await prisma.auditLog.deleteMany({});
    await prisma.securityEvent.deleteMany({});

    console.log('   8. Deleting Profiles...');
    await prisma.studentProfile.deleteMany({});
    await prisma.teacherProfile.deleteMany({});
    await prisma.adminProfile.deleteMany({});

    console.log('   9. Deleting Users...');
    const result = await prisma.user.deleteMany({});

    console.log('\n✨ Database cleanup completed!');
    console.log(
      `   - Deleted: ${result.count} users and all associated data\n`
    );
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚨 FULL SYSTEM CLEANUP INITIATED 🚨\n');
  console.log('This will delete EVERYTHING from:');
  console.log('1. Firebase Authentication');
  console.log('2. Neon Database\n');

  // Step 1: Trigger Firebase Cleanup
  console.log('--- STEP 1: FIREBASE CLEANUP ---');
  await deleteAllFirebaseUsers();
  console.log('--- FIREBASE CLEANUP FINISHED ---\n');

  // Step 2: Trigger Database Cleanup
  console.log('--- STEP 2: DATABASE CLEANUP ---');
  await deleteAllDatabaseData();
  console.log('--- DATABASE CLEANUP FINISHED ---\n');

  console.log('✅ COMPLETE SYSTEM CLEANUP FINISHED SUCCESSFULLY!\n');
  console.log('💡 You can now run the seed script to create fresh data:\n');
  console.log('   bun run prisma/seed-users-complete.ts\n');
}

main()
  .catch(e => {
    console.error('❌ CRITICAL ERROR during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
