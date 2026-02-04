/**
 * Database Test Script
 * Validates database setup and basic operations
 */

import { UserRole } from '@prisma/client';
import { DatabaseService } from '../src/lib/services/database.service';
import { FirebaseSyncService } from '../src/lib/services/firebase-sync.service';
import { DatabaseFactory } from '../src/lib/factories/database.factory';

async function testDatabaseSetup() {
  console.log('🧪 Testing database setup...');

  try {
    // Test database service creation
    const dbService = DatabaseFactory.getDatabaseService();
    console.log('✅ Database service created successfully');

    // Test sync service creation
    const syncService = DatabaseFactory.getSyncService();
    console.log('✅ Sync service created successfully');

    // Test database connection by checking existing users
    const testUser = await dbService.getUserProfile(
      'static-admin-uid-placeholder'
    );
    if (testUser) {
      console.log('✅ Database connection working - found static admin');
      console.log(
        `   Admin: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`
      );
    } else {
      console.log('⚠️  Static admin not found - database may need seeding');
    }

    // Test role validation
    const adminRole = UserRole.ADMIN;
    console.log(`✅ Role enum working: ${adminRole}`);

    console.log('🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseSetup()
  .then(() => {
    console.log('✅ Database validation completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Database validation failed:', error);
    process.exit(1);
  });
