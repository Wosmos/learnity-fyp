/**
 * Database Utilities
 * Common database operations and helpers
 */

import { UserRole, ApplicationStatus } from '@prisma/client';

export class DatabaseUtils {
  /**
   * Validate Firebase UID format
   */
  static isValidFirebaseUid(uid: string): boolean {
    return typeof uid === 'string' && uid.length > 0 && uid.length <= 128;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Calculate profile completion percentage for students
   */
  static calculateStudentProfileCompletion(profile: {
    gradeLevel: string;
    subjects: string[];
    learningGoals?: string[];
    interests?: string[];
    studyPreferences?: string[];
  }): number {
    let percentage = 20; // Base completion for basic info

    if (profile.subjects.length > 0) percentage += 20;
    if (profile.learningGoals && profile.learningGoals.length > 0) percentage += 20;
    if (profile.interests && profile.interests.length > 0) percentage += 20;
    if (profile.studyPreferences && profile.studyPreferences.length > 0) percentage += 20;

    return Math.min(percentage, 100);
  }

  /**
   * Get default permissions for user role
   */
  static getDefaultPermissions(role: UserRole): string[] {
    switch (role) {
      case UserRole.STUDENT:
        return [
          'view:student_dashboard',
          'join:study_groups',
          'book:tutoring',
          'enhance:profile'
        ];
      
      case UserRole.TEACHER:
        return [
          'view:teacher_dashboard',
          'manage:sessions',
          'upload:content',
          'view:student_progress'
        ];
      
      case UserRole.PENDING_TEACHER:
        return [
          'view:application_status',
          'update:application'
        ];
      
      case UserRole.ADMIN:
        return [
          'view:admin_panel',
          'manage:users',
          'approve:teachers',
          'view:audit_logs',
          'manage:platform'
        ];
      
      default:
        return [];
    }
  }

  /**
   * Check if user can transition to new role
   */
  static canTransitionToRole(currentRole: UserRole, newRole: UserRole): boolean {
    const allowedTransitions: Record<UserRole, UserRole[]> = {
      [UserRole.STUDENT]: [], // Students cannot change roles directly
      [UserRole.PENDING_TEACHER]: [UserRole.TEACHER], // Can be approved to teacher
      [UserRole.TEACHER]: [], // Teachers cannot change roles directly
      [UserRole.ADMIN]: [UserRole.STUDENT, UserRole.TEACHER] // Admins can assign roles
    };

    return allowedTransitions[currentRole]?.includes(newRole) || false;
  }

  /**
   * Generate audit log metadata
   */
  static generateAuditMetadata(action: string, additionalData?: Record<string, any>): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      action,
      source: 'database_service',
      ...additionalData
    };
  }

  /**
   * Sanitize user input for database storage
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Format user display name
   */
  static formatDisplayName(firstName: string, lastName: string): string {
    return `${firstName.trim()} ${lastName.trim()}`;
  }

  /**
   * Check if teacher application is complete
   */
  static isTeacherApplicationComplete(application: {
    qualifications: string[];
    subjects: string[];
    experience: number;
    bio?: string;
    documents: string[];
  }): boolean {
    return (
      application.qualifications.length > 0 &&
      application.subjects.length > 0 &&
      application.experience >= 0 &&
      application.documents.length > 0
    );
  }

  /**
   * Get application status display text
   */
  static getApplicationStatusText(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'Under Review';
      case ApplicationStatus.APPROVED:
        return 'Approved';
      case ApplicationStatus.REJECTED:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }
}