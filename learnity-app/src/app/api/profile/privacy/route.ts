/**
 * Privacy Settings API Route
 * Handles student profile privacy settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfileEnhancementService } from '@/lib/services/profile-enhancement.service';
import { authenticateApiRequest } from '@/lib/utils/api-auth.utils';
import { ServiceFactory } from '@/lib/factories/service.factory';
import { z } from 'zod';

const profileService = new ProfileEnhancementService();

// Validation schema
const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']),
  showEmail: z.boolean(),
  showLearningGoals: z.boolean(),
  showInterests: z.boolean(),
  showProgress: z.boolean(),
  allowMessages: z.boolean(),
});

/**
 * PUT /api/profile/privacy
 * Update privacy settings
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
        { error: 'Only students can update privacy settings' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = privacySettingsSchema.parse(body);

    // Update privacy settings
    await profileService.updatePrivacySettings(user.id, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
    });
  } catch (error: any) {
    console.error('Privacy settings update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/privacy
 * Get privacy settings
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

    // Get privacy settings
    const settings = await profileService.getPrivacySettings(user.id);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('Privacy settings fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}
