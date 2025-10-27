/**
 * Database Factory
 * Implements Factory pattern for database service creation
 */

import { DatabaseService } from '../services/database.service';
import { FirebaseSyncService } from '../services/firebase-sync.service';
import { IUserProfileService, ISyncService } from '../interfaces/database-sync.interface';

export class DatabaseFactory {
  private static databaseServiceInstance: DatabaseService | null = null;
  private static syncServiceInstance: FirebaseSyncService | null = null;

  /**
   * Get singleton instance of DatabaseService
   */
  static getDatabaseService(): IUserProfileService {
    if (!this.databaseServiceInstance) {
      this.databaseServiceInstance = new DatabaseService();
    }
    return this.databaseServiceInstance;
  }

  /**
   * Get singleton instance of FirebaseSyncService
   */
  static getSyncService(): ISyncService {
    if (!this.syncServiceInstance) {
      this.syncServiceInstance = new FirebaseSyncService();
    }
    return this.syncServiceInstance;
  }

  /**
   * Create new instance of DatabaseService (for testing)
   */
  static createDatabaseService(): IUserProfileService {
    return new DatabaseService();
  }

  /**
   * Create new instance of FirebaseSyncService (for testing)
   */
  static createSyncService(): ISyncService {
    return new FirebaseSyncService();
  }

  /**
   * Reset singleton instances (for testing)
   */
  static resetInstances(): void {
    this.databaseServiceInstance = null;
    this.syncServiceInstance = null;
  }
}