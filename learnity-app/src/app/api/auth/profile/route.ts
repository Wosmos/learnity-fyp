/**
 * API Route: Get User Profile
 * Fetches user profile data from Neon DB
 */

import { NextRequest } from 'next/server';
import { ServiceFactory } from '@/lib/factories/service.factory';
import { authenticateApiRequest } from '@/lib/utils/api-auth.utils';
import { createSuccessResponse, createNotFoundErrorResponse, withErrorHandling } from '@/lib/utils/api-response.utils';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { databaseService } = ServiceFactory.getAuthServices();

  // Authenticate request
  const authResult = await authenticateApiRequest(request);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Get user profile from database
  const userProfile = await databaseService.getUserProfile(authResult.uid!);

  if (!userProfile) {
    return createNotFoundErrorResponse('User profile');
  }

  // Return sanitized profile data
  const profileData = {
    id: userProfile.id,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    role: userProfile.role,
    profilePicture: userProfile.profilePicture,
    emailVerified: userProfile.emailVerified,
    createdAt: userProfile.createdAt,
    lastLoginAt: userProfile.lastLoginAt,
    authProvider: userProfile.authProvider,
    socialProviders: userProfile.socialProviders,
    
    // Role-specific data
    ...(userProfile.role === 'STUDENT' && userProfile.studentProfile && {
      studentProfile: {
        gradeLevel: userProfile.studentProfile.gradeLevel,
        subjects: userProfile.studentProfile.subjects,
        learningGoals: userProfile.studentProfile.learningGoals,
        interests: userProfile.studentProfile.interests,
        studyPreferences: userProfile.studentProfile.studyPreferences,
        bio: userProfile.studentProfile.bio,
        profileCompletionPercentage: userProfile.studentProfile.profileCompletionPercentage
      }
    }),
    
    ...(userProfile.role === 'TEACHER' && userProfile.teacherProfile && {
      teacherProfile: {
        applicationStatus: userProfile.teacherProfile.applicationStatus,
        subjects: userProfile.teacherProfile.subjects,
        qualifications: userProfile.teacherProfile.qualifications,
        experience: userProfile.teacherProfile.experience,
        bio: userProfile.teacherProfile.bio
      }
    }),
    
    ...(userProfile.role === 'ADMIN' && userProfile.adminProfile && {
      adminProfile: {
        department: userProfile.adminProfile.department,
        isStatic: userProfile.adminProfile.isStatic
      }
    })
  };

  return createSuccessResponse(profileData, 'Profile retrieved successfully');
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const { databaseService } = ServiceFactory.getAuthServices();

  // Authenticate request
  const authResult = await authenticateApiRequest(request);
  if (!authResult.success) {
    return authResult.response!;
  }

  // Parse request body
  const updateData = await request.json();

  // Update user profile
  const updatedProfile = await databaseService.updateUserProfile(
    authResult.uid!,
    updateData
  );

  if (!updatedProfile) {
    return createNotFoundErrorResponse('User profile');
  }

  return createSuccessResponse(updatedProfile, 'Profile updated successfully');
});