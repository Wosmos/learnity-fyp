import { User as FirebaseUser } from 'firebase/auth';
import { prisma } from '@/lib/config/database';
import { FirebaseAuthService } from './firebase-auth.service';
import { ISyncService, SyncReport, Inconsistency } from '@/lib/interfaces/auth';
import { UserRole, CustomClaims, Permission } from '@/types/auth';

export class SyncService implements ISyncService {
  private firebaseAuthService: FirebaseAuthService;

  constructor() {
    this.firebaseAuthService = new FirebaseAuthService();
  }

  /**
   * Sync Firebase user changes to Neon DB
   */
  async syncFirebaseUserToNeonDB(firebaseUser: FirebaseUser): Promise<void> {
    try {
      // Check if user exists in Neon DB
      const existingUser = await prisma.user.findUnique({
        where: { firebaseUid: firebaseUser.uid }
      });

      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { firebaseUid: firebaseUser.uid },
          data: {
            email: firebaseUser.email || existingUser.email,
            emailVerified: firebaseUser.emailVerified,
            lastLoginAt: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        console.warn(`User with Firebase UID ${firebaseUser.uid} not found in Neon DB`);
        // This should not happen in normal flow as users are created during registration
        // But we can handle it gracefully by creating a basic user record
        await this.createBasicUserRecord(firebaseUser);
      }
    } catch (error) {
      console.error('Error syncing Firebase user to Neon DB:', error);
      throw error;
    }
  }

  /**
   * Update Firebase custom claims from Neon DB data
   */
  async syncNeonDBToFirebaseClaims(firebaseUid: string): Promise<void> {
    try {
      // Get user data from Neon DB
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        include: {
          studentProfile: true,
          teacherProfile: true,
          adminProfile: true
        }
      });

      if (!user) {
        throw new Error(`User with Firebase UID ${firebaseUid} not found in Neon DB`);
      }

      // Determine permissions based on role
      const permissions = this.getPermissionsForRole(user.role as UserRole);

      // Calculate profile completion
      const profileComplete = this.calculateProfileCompletion(user);

      // Create custom claims
      const customClaims: CustomClaims = {
        role: user.role as UserRole,
        permissions,
        profileComplete,
        emailVerified: user.emailVerified
      };

      // Update Firebase custom claims
      await this.firebaseAuthService.setCustomClaims(firebaseUid, customClaims);
    } catch (error) {
      console.error('Error syncing Neon DB to Firebase claims:', error);
      throw error;
    }
  }

  /**
   * Handle email verification sync
   */
  async handleEmailVerificationSync(firebaseUid: string): Promise<void> {
    try {
      // Update email verification status in Neon DB
      await prisma.user.update({
        where: { firebaseUid },
        data: {
          emailVerified: true,
          updatedAt: new Date()
        }
      });

      // Update Firebase custom claims to reflect verification
      await this.syncNeonDBToFirebaseClaims(firebaseUid);

      console.log(`Email verification synced for user ${firebaseUid}`);
    } catch (error) {
      console.error('Error syncing email verification:', error);
      throw error;
    }
  }

  /**
   * Perform consistency check between Firebase and Neon DB
   */
  async performConsistencyCheck(): Promise<SyncReport> {
    const startTime = Date.now();
    const inconsistencies: Inconsistency[] = [];
    let totalUsers = 0;
    let syncedUsers = 0;
    let failedUsers = 0;

    try {
      // Get all users from Neon DB
      const users = await prisma.user.findMany({
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          emailVerified: true,
          role: true
        }
      });

      totalUsers = users.length;

      for (const user of users) {
        try {
          // Get Firebase user data
          const firebaseUser = await this.firebaseAuthService.getCurrentUser();
          
          if (!firebaseUser || firebaseUser.uid !== user.firebaseUid) {
            // Skip if not the current user (we can't check other users without admin privileges in client-side)
            continue;
          }

          // Check email verification consistency
          if (user.emailVerified !== firebaseUser.emailVerified) {
            inconsistencies.push({
              firebaseUid: user.firebaseUid,
              field: 'emailVerified',
              firebaseValue: firebaseUser.emailVerified,
              neonDBValue: user.emailVerified,
              resolved: false
            });

            // Auto-resolve by updating Neon DB to match Firebase
            await prisma.user.update({
              where: { firebaseUid: user.firebaseUid },
              data: { emailVerified: firebaseUser.emailVerified }
            });

            inconsistencies[inconsistencies.length - 1].resolved = true;
          }

          // Check email consistency
          if (user.email !== firebaseUser.email) {
            inconsistencies.push({
              firebaseUid: user.firebaseUid,
              field: 'email',
              firebaseValue: firebaseUser.email,
              neonDBValue: user.email,
              resolved: false
            });

            // Auto-resolve by updating Neon DB to match Firebase
            await prisma.user.update({
              where: { firebaseUid: user.firebaseUid },
              data: { email: firebaseUser.email || user.email }
            });

            inconsistencies[inconsistencies.length - 1].resolved = true;
          }

          syncedUsers++;
        } catch (error) {
          console.error(`Failed to sync user ${user.firebaseUid}:`, error);
          failedUsers++;
        }
      }

      const executionTime = Date.now() - startTime;

      return {
        totalUsers,
        syncedUsers,
        failedUsers,
        inconsistencies,
        executionTime
      };
    } catch (error) {
      console.error('Error during consistency check:', error);
      throw error;
    }
  }

  /**
   * Create a basic user record for Firebase users not in Neon DB
   */
  private async createBasicUserRecord(firebaseUser: FirebaseUser): Promise<void> {
    try {
      // Extract name from display name or email
      const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      await prisma.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName,
          lastName,
          role: UserRole.STUDENT, // Default to student
          emailVerified: firebaseUser.emailVerified,
          isActive: true,
          lastLoginAt: new Date()
        }
      });

      console.log(`Created basic user record for Firebase UID: ${firebaseUser.uid}`);
    } catch (error) {
      console.error('Error creating basic user record:', error);
      throw error;
    }
  }

  /**
   * Get permissions for a user role
   */
  private getPermissionsForRole(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.STUDENT:
        return [
          Permission.VIEW_STUDENT_DASHBOARD,
          Permission.JOIN_STUDY_GROUPS,
          Permission.BOOK_TUTORING,
          Permission.ENHANCE_PROFILE
        ];
      
      case UserRole.TEACHER:
        return [
          Permission.VIEW_TEACHER_DASHBOARD,
          Permission.MANAGE_SESSIONS,
          Permission.UPLOAD_CONTENT,
          Permission.VIEW_STUDENT_PROGRESS
        ];
      
      case UserRole.PENDING_TEACHER:
        return [
          Permission.VIEW_APPLICATION_STATUS,
          Permission.UPDATE_APPLICATION
        ];
      
      case UserRole.ADMIN:
        return [
          Permission.VIEW_ADMIN_PANEL,
          Permission.MANAGE_USERS,
          Permission.APPROVE_TEACHERS,
          Permission.VIEW_AUDIT_LOGS,
          Permission.MANAGE_PLATFORM
        ];
      
      default:
        return [];
    }
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateProfileCompletion(user: any): boolean {
    // Basic profile is considered complete if user has:
    // - First name, last name, email
    // - Role-specific profile data
    
    const hasBasicInfo = !!(user.firstName && user.lastName && user.email);
    
    if (!hasBasicInfo) return false;

    switch (user.role) {
      case UserRole.STUDENT:
        return !!(user.studentProfile && user.studentProfile.gradeLevel && user.studentProfile.subjects?.length > 0);
      
      case UserRole.TEACHER:
        return !!(user.teacherProfile && 
                 user.teacherProfile.qualifications?.length > 0 && 
                 user.teacherProfile.subjects?.length > 0 &&
                 user.teacherProfile.bio);
      
      case UserRole.PENDING_TEACHER:
        return !!(user.teacherProfile && 
                 user.teacherProfile.qualifications?.length > 0 && 
                 user.teacherProfile.subjects?.length > 0 &&
                 user.teacherProfile.bio);
      
      case UserRole.ADMIN:
        return !!(user.adminProfile);
      
      default:
        return hasBasicInfo;
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();