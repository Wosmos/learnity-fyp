/**
 * Teacher Application Status API Route
 * GET /api/teacher/application-status - Get teacher's application status and profile completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

export interface ProfileCompletionItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  impact: string;
  category: 'required' | 'recommended' | 'optional';
}

export interface ApplicationStatusResponse {
  applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  profileCompletion: number;
  completionItems: ProfileCompletionItem[];
  canReapply: boolean;
  reapplyDate: string | null;
  improvementAreas: string[];
  estimatedReviewTime: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string | null;
    qualifications: string[];
    subjects: string[];
    experience: number;
    documents: string[];
    videoIntroUrl: string | null;
    profilePicture: string | null;
  };
}

/**
 * Calculate profile completion percentage based on filled fields
 */
function calculateProfileCompletion(profile: any): { percentage: number; items: ProfileCompletionItem[] } {
  const items: ProfileCompletionItem[] = [
    {
      id: 'bio',
      title: 'Professional Bio',
      description: 'Write a compelling bio about your teaching experience',
      completed: !!profile.bio && profile.bio.length > 50,
      impact: '+15% Conversion',
      category: 'required',
    },
    {
      id: 'video',
      title: 'Intro Video',
      description: 'Upload a video introduction to connect with students',
      completed: !!profile.videoIntroUrl,
      impact: '+25% Success',
      category: 'recommended',
    },
    {
      id: 'documents',
      title: 'Verify Degrees',
      description: 'Upload your certifications and qualifications',
      completed: profile.documents && profile.documents.length > 0,
      impact: 'Speed Up Review',
      category: 'required',
    },
    {
      id: 'qualifications',
      title: 'List Qualifications',
      description: 'Add your educational qualifications',
      completed: profile.qualifications && profile.qualifications.length > 0,
      impact: '+10% Trust',
      category: 'required',
    },
    {
      id: 'subjects',
      title: 'Teaching Subjects',
      description: 'Specify the subjects you can teach',
      completed: profile.subjects && profile.subjects.length > 0,
      impact: 'Better Matching',
      category: 'required',
    },
    {
      id: 'availability',
      title: 'Teaching Hours',
      description: 'Set your available teaching hours',
      completed: profile.availableDays && profile.availableDays.length > 0,
      impact: 'More Bookings',
      category: 'recommended',
    },
    {
      id: 'profilePicture',
      title: 'Profile Picture',
      description: 'Add a professional profile photo',
      completed: !!profile.profilePicture,
      impact: '+20% Engagement',
      category: 'recommended',
    },
    {
      id: 'experience',
      title: 'Years of Experience',
      description: 'Specify your teaching experience',
      completed: profile.experience > 0,
      impact: '+5% Trust',
      category: 'required',
    },
  ];

  const completedCount = items.filter(item => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return { percentage, items };
}

/**
 * GET /api/teacher/application-status
 * Retrieve teacher's application status and profile completion details
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user (allow pending and rejected teachers too)
    const authResult = await authMiddleware(request, {
      allowMultipleRoles: [UserRole.TEACHER, UserRole.PENDING_TEACHER, UserRole.REJECTED_TEACHER, UserRole.ADMIN],
    });

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get user with teacher profile from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      include: {
        teacherProfile: true,
      },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    if (!dbUser.teacherProfile) {
      return createAuthErrorResponse('Teacher profile not found');
    }

    const profile = dbUser.teacherProfile;
    const { percentage, items } = calculateProfileCompletion(profile);

    // Calculate improvement areas based on incomplete items
    const improvementAreas = items
      .filter(item => !item.completed && item.category !== 'optional')
      .map(item => item.title);

    // Calculate reapply date (30 days after rejection)
    let reapplyDate: string | null = null;
    let canReapply = false;
    
    if (profile.applicationStatus === 'REJECTED' && profile.reviewedAt) {
      const reapplyDateObj = new Date(profile.reviewedAt);
      reapplyDateObj.setDate(reapplyDateObj.getDate() + 30);
      reapplyDate = reapplyDateObj.toLocaleDateString();
      canReapply = new Date() >= reapplyDateObj;
    }

    // Estimate review time based on queue (simplified)
    const pendingCount = await prisma.teacherProfile.count({
      where: { applicationStatus: 'PENDING' },
    });
    const estimatedDays = Math.max(1, Math.ceil(pendingCount / 10)); // ~10 reviews per day
    const estimatedReviewTime = `${estimatedDays}-${estimatedDays + 2} business days`;

    const response: ApplicationStatusResponse = {
      applicationStatus: profile.applicationStatus,
      submittedAt: profile.submittedAt,
      reviewedAt: profile.reviewedAt,
      rejectionReason: profile.rejectionReason,
      profileCompletion: percentage,
      completionItems: items,
      canReapply,
      reapplyDate,
      improvementAreas,
      estimatedReviewTime,
      profile: {
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        bio: profile.bio,
        qualifications: profile.qualifications,
        subjects: profile.subjects,
        experience: profile.experience,
        documents: profile.documents,
        videoIntroUrl: profile.videoIntroUrl,
        profilePicture: profile.profilePicture || dbUser.profilePicture,
      },
    };

    return createSuccessResponse(response, 'Application status retrieved successfully');
  } catch (error) {
    console.error('Error fetching application status:', error);
    return createInternalErrorResponse('Failed to fetch application status');
  }
}
