/**
 * Database Service Implementation
 * Handles all Neon DB operations with Prisma ORM
 */

import { PrismaClient, User, UserRole as PrismaUserRole, ApplicationStatus as PrismaApplicationStatus } from '@prisma/client';
import { 
  IUserProfileService, 
  CreateProfileData, 
  UpdateProfileData,
  TeacherApplicationData,
  TeacherApplication,
  ProfileCompletion
} from '@/lib/interfaces/auth';
import { StudentProfileEnhancementData, TeacherApprovalData } from '@/lib/validators/auth';
import { UserRole, ApplicationStatus } from '@/types/auth';

export class DatabaseService implements IUserProfileService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create user profile in Neon DB
   */
  async createUserProfile(firebaseUid: string, data: CreateProfileData): Promise<any> {
    return await this.prisma.user.create({
      data: {
        firebaseUid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        emailVerified: data.emailVerified || false,
        profilePicture: data.profilePicture,
        // Create role-specific profile
        ...(data.role === UserRole.STUDENT && data.studentProfile && {
          studentProfile: {
            create: {
              gradeLevel: data.studentProfile.gradeLevel || 'Not specified',
              subjects: data.studentProfile.subjects || [],
              learningGoals: data.studentProfile.learningGoals || [],
              interests: data.studentProfile.interests || [],
              studyPreferences: data.studentProfile.studyPreferences || [],
              profileCompletionPercentage: data.studentProfile.profileCompletionPercentage || 20
            }
          }
        }),
        ...(data.role === UserRole.PENDING_TEACHER && data.teacherProfile && {
          teacherProfile: {
            create: {
              applicationStatus: PrismaApplicationStatus.PENDING,
              qualifications: data.teacherProfile.qualifications || [],
              subjects: data.teacherProfile.subjects || [],
              experience: data.teacherProfile.experience || 0,
              bio: data.teacherProfile.bio,
              hourlyRate: data.teacherProfile.hourlyRate,
              documents: data.teacherProfile.documents || []
            }
          }
        }),
        ...(data.role === UserRole.ADMIN && data.adminProfile && {
          adminProfile: {
            create: {
              department: data.adminProfile.department || 'Platform Management',
              isStatic: data.adminProfile.isStatic || false,
              createdBy: data.adminProfile.createdBy
            }
          }
        })
      },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true
      }
    });
  }  /**
   
* Get user profile by Firebase UID
   */
  async getUserProfile(firebaseUid: string): Promise<any> {
    return await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true
      }
    });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(firebaseUid: string, data: UpdateProfileData): Promise<any> {
    return await this.prisma.user.update({
      where: { firebaseUid },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.profilePicture && { profilePicture: data.profilePicture }),
        ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
        ...(data.lastLoginAt && { lastLoginAt: data.lastLoginAt })
      },
      include: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true
      }
    });
  }

  /**
   * Get user role by Firebase UID
   */
  async getUserRole(firebaseUid: string): Promise<UserRole> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { role: true }
    });
    
    if (!user) {
      throw new Error(`User not found with firebaseUid: ${firebaseUid}`);
    }
    
    return user.role as UserRole;
  }

  /**
   * Update user role
   */
  async updateUserRole(firebaseUid: string, role: UserRole): Promise<void> {
    await this.prisma.user.update({
      where: { firebaseUid },
      data: { role }
    });
  }  /**
   * 
Submit teacher application
   */
  async submitTeacherApplication(firebaseUid: string, application: TeacherApplicationData): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { teacherProfile: true }
    });

    if (!user) {
      throw new Error(`User not found with firebaseUid: ${firebaseUid}`);
    }

    if (user.teacherProfile) {
      // Update existing teacher profile
      await this.prisma.teacherProfile.update({
        where: { userId: user.id },
        data: {
          qualifications: application.qualifications,
          subjects: application.subjects,
          experience: application.experience,
          bio: application.bio,
          hourlyRate: application.hourlyRate,
          documents: application.documents,
          submittedAt: new Date()
        }
      });
    } else {
      // Create new teacher profile
      await this.prisma.teacherProfile.create({
        data: {
          userId: user.id,
          qualifications: application.qualifications,
          subjects: application.subjects,
          experience: application.experience,
          bio: application.bio,
          hourlyRate: application.hourlyRate,
          documents: application.documents
        }
      });
    }
  }

  /**
   * Get teacher applications by status
   */
  async getTeacherApplications(status?: ApplicationStatus): Promise<TeacherApplication[]> {
    const teacherProfiles = await this.prisma.teacherProfile.findMany({
      where: status ? { applicationStatus: status as PrismaApplicationStatus } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            firebaseUid: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return teacherProfiles.map(profile => ({
      id: profile.id,
      userId: profile.userId,
      applicationStatus: profile.applicationStatus as ApplicationStatus,
      qualifications: profile.qualifications,
      subjects: profile.subjects,
      experience: profile.experience,
      bio: profile.bio || undefined,
      hourlyRate: profile.hourlyRate ? Number(profile.hourlyRate) : undefined,
      documents: profile.documents,
      submittedAt: profile.submittedAt,
      reviewedAt: profile.reviewedAt || undefined,
      approvedBy: profile.approvedBy || undefined,
      rejectionReason: profile.rejectionReason || undefined,
      user: profile.user
    }));
  } 
 /**
   * Review teacher application (approve/reject)
   */
  async reviewTeacherApplication(applicationId: string, decision: TeacherApprovalData): Promise<void> {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { id: applicationId },
      include: { user: true }
    });

    if (!teacherProfile) {
      throw new Error(`Teacher application not found with id: ${applicationId}`);
    }

    // Update teacher profile
    await this.prisma.teacherProfile.update({
      where: { id: applicationId },
      data: {
        applicationStatus: decision.decision === 'APPROVED' ? PrismaApplicationStatus.APPROVED : PrismaApplicationStatus.REJECTED,
        reviewedAt: new Date(),
        approvedBy: decision.decision === 'APPROVED' ? 'admin' : undefined,
        rejectionReason: decision.rejectionReason
      }
    });

    // Update user role if approved
    if (decision.decision === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: teacherProfile.userId },
        data: { role: UserRole.TEACHER }
      });
    }
  }

  /**
   * Enhance student profile with additional information
   */
  async enhanceStudentProfile(firebaseUid: string, enhancements: StudentProfileEnhancementData): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      throw new Error(`Student profile not found for firebaseUid: ${firebaseUid}`);
    }

    // Calculate new completion percentage
    const currentProfile = user.studentProfile;
    let completionPercentage = 20; // Base completion

    if (enhancements.learningGoals && enhancements.learningGoals.length > 0) completionPercentage += 20;
    if (enhancements.interests && enhancements.interests.length > 0) completionPercentage += 20;
    if (enhancements.studyPreferences && enhancements.studyPreferences.length > 0) completionPercentage += 20;
    if (currentProfile.subjects.length > 0) completionPercentage += 20;

    await this.prisma.studentProfile.update({
      where: { userId: user.id },
      data: {
        learningGoals: enhancements.learningGoals || currentProfile.learningGoals,
        interests: enhancements.interests || currentProfile.interests,
        studyPreferences: enhancements.studyPreferences || currentProfile.studyPreferences,
        profileCompletionPercentage: Math.min(completionPercentage, 100)
      }
    });
  }  /**
 
  * Get profile completion status for student
   */
  async getProfileCompletionStatus(firebaseUid: string): Promise<ProfileCompletion> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      throw new Error(`Student profile not found for firebaseUid: ${firebaseUid}`);
    }

    const profile = user.studentProfile;
    const completedSections: string[] = ['Basic Information']; // Always completed
    const missingFields: string[] = [];

    // Check completion status
    if (profile.subjects.length > 0) {
      completedSections.push('Subject Interests');
    } else {
      missingFields.push('Subject Interests');
    }

    if (profile.learningGoals && profile.learningGoals.length > 0) {
      completedSections.push('Learning Goals');
    } else {
      missingFields.push('Learning Goals');
    }

    if (profile.interests && profile.interests.length > 0) {
      completedSections.push('Personal Interests');
    } else {
      missingFields.push('Personal Interests');
    }

    if (profile.studyPreferences && profile.studyPreferences.length > 0) {
      completedSections.push('Study Preferences');
    } else {
      missingFields.push('Study Preferences');
    }

    return {
      percentage: profile.profileCompletionPercentage,
      missingFields,
      completedSections
    };
  }

  /**
   * Cleanup database connections
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}