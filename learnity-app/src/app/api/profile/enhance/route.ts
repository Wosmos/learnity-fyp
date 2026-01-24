/**
 * Profile Enhancement API Route
 * Handles student profile customization and updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfileEnhancementService } from '@/lib/services/profile-enhancement.service';
import { authenticateApiRequest } from '@/lib/utils/api-auth.utils';
import { ServiceFactory } from '@/lib/factories/service.factory';
import { z } from 'zod';

const profileService = new ProfileEnhancementService();

// Validation schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  learningGoals: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  studyPreferences: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  gradeLevel: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

/**
 * PUT /api/profile/enhance
 * Update student profile with enhanced information
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return authResult.response!;
    }

    // Get user from database
    const { databaseService } = ServiceFactory.getAuthServices();
    const user = await databaseService.getUserProfile(authResult.uid!);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify user is a student
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can enhance their profile' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Update profile
    await profileService.updateStudentProfile(user.id, validatedData);

    // Get updated completion data
    const completionData = await profileService.getProfileCompletion(user.id);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      completion: completionData,
    });
  } catch (error: any) {
    console.error('Profile enhancement error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/enhance
 * Get profile completion data
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return authResult.response!;
    }

    // Get user from database
    const { databaseService } = ServiceFactory.getAuthServices();
    const user = await databaseService.getUserProfile(authResult.uid!);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get completion data
    const completionData = await profileService.getProfileCompletion(user.id);

    return NextResponse.json({
      success: true,
      completion: completionData,
    });
  } catch (error: any) {
    console.error('Profile completion fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile completion' },
      { status: 500 }
    );
  }
}
