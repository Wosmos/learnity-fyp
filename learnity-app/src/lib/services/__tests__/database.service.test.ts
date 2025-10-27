/**
 * Database Service Tests
 * Unit tests for database operations
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DatabaseService } from '../database.service';
import { UserRole, ApplicationStatus } from '@prisma/client';
import { CreateProfileData, TeacherApplicationData } from '../../interfaces/database-sync.interface';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  const testFirebaseUid = 'test-firebase-uid-123';
  const testEmail = 'test@example.com';

  beforeEach(() => {
    databaseService = new DatabaseService();
  });

  afterEach(async () => {
    await databaseService.disconnect();
  });

  describe('createUserProfile', () => {
    it('should create student profile successfully', async () => {
      const profileData: CreateProfileData = {
        email: testEmail,
        firstName: 'Test',
        lastName: 'Student',
        role: UserRole.STUDENT,
        emailVerified: false
      };

      const user = await databaseService.createUserProfile(testFirebaseUid, profileData);

      expect(user).toBeDefined();
      expect(user.firebaseUid).toBe(testFirebaseUid);
      expect(user.email).toBe(testEmail);
      expect(user.role).toBe(UserRole.STUDENT);
      expect(user.studentProfile).toBeDefined();
      expect(user.studentProfile?.profileCompletionPercentage).toBe(20);
    });

    it('should create pending teacher profile successfully', async () => {
      const profileData: CreateProfileData = {
        email: 'teacher@example.com',
        firstName: 'Test',
        lastName: 'Teacher',
        role: UserRole.PENDING_TEACHER,
        emailVerified: true
      };

      const user = await databaseService.createUserProfile('teacher-uid', profileData);

      expect(user).toBeDefined();
      expect(user.role).toBe(UserRole.PENDING_TEACHER);
      expect(user.teacherProfile).toBeDefined();
      expect(user.teacherProfile?.applicationStatus).toBe(ApplicationStatus.PENDING);
    });
  });

  describe('getUserProfile', () => {
    it('should return null for non-existent user', async () => {
      const user = await databaseService.getUserProfile('non-existent-uid');
      expect(user).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should throw error for non-existent user', async () => {
      await expect(databaseService.getUserRole('non-existent-uid'))
        .rejects.toThrow('User not found');
    });
  });
});