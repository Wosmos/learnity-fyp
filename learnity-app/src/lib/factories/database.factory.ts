/**
 * Database Factory
 * Implements Factory pattern for database service creation
 */

import { DatabaseService } from '../services/database.service';
import { FirebaseSyncService } from '../services/firebase-sync.service';
import { IUserProfileService, ISyncService } from '../interfaces/auth';

export class DatabaseFactory {
  private static databaseServiceInstance: DatabaseService | null = null;
  private static syncServiceInstance: FirebaseSyncService | null = null;

  /**
   * Get singleton instance of DatabaseService
   */
  static getDatabaseService(): any {
    if (!this.databaseServiceInstance) {
      this.databaseServiceInstance = new DatabaseService();
    }
    return this.databaseServiceInstance;
  }

  /**
   * Get singleton instance of FirebaseSyncService
   */
  static getSyncService(): any {
    if (!this.syncServiceInstance) {
      this.syncServiceInstance = new FirebaseSyncService();
    }
    return this.syncServiceInstance;
  }

  /**
   * Create new instance of DatabaseService (for testing)
   */
  static createDatabaseService(): any {
    return new DatabaseService();
  }

  /**
   * Create new instance of FirebaseSyncService (for testing)
   */
  static createSyncService(): any {
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