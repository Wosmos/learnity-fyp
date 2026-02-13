import { adminAuth } from '../src/lib/config/firebase-admin';

/**
 * Cleanup Script - Delete All Firebase Users
 * This is a standalone script that can be called independently.
 */
export async function deleteAllFirebaseUsers() {
  console.log('🗑️  Starting Firebase users cleanup...');
  console.log('⚠️  WARNING: This will delete ALL users from Firebase Auth!\n');

  let deletedCount = 0;
  let errorCount = 0;
  let pageToken: string | undefined;

  try {
    do {
      // List users in batches of 1000
      const listUsersResult = await adminAuth.listUsers(1000, pageToken);

      console.log(
        `📋 Found ${listUsersResult.users.length} users in this batch...`
      );

      if (listUsersResult.users.length === 0) break;

      // Delete users in batches (using adminAuth.deleteUsers max limit of 1000)
      const uids = listUsersResult.users.map(u => u.uid);

      try {
        const result = await adminAuth.deleteUsers(uids);
        deletedCount += result.successCount;
        errorCount += result.failureCount;

        if (result.failureCount > 0) {
          result.errors.forEach(err => {
            console.log(
              `   ⚠️  Error deleting user ${err.index}: ${err.error.message}`
            );
          });
        }

        console.log(`   ✅ Successfully deleted ${deletedCount} users...`);
      } catch (batchError: any) {
        console.error('   ❌ Batch delete failed:', batchError.message);
        // Fallback to one by one if deleteUsers fails (maybe not supported)
        for (const uid of uids) {
          try {
            await adminAuth.deleteUser(uid);
            deletedCount++;
          } catch (e: any) {
            errorCount++;
          }
        }
      }

      pageToken = listUsersResult.pageToken;
    } while (pageToken);

    console.log('\n✨ Firebase cleanup completed!');
    console.log(`   - Total Deleted: ${deletedCount} users`);
    console.log(`   - Total Errors: ${errorCount} users\n`);

    return { deletedCount, errorCount };
  } catch (error) {
    console.error('❌ Firebase cleanup failed:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  deleteAllFirebaseUsers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
