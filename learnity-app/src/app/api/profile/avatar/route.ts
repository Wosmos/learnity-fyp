/**
 * Avatar Upload API Route
 * Handles avatar upload and deletion for user profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProfileEnhancementService } from '@/lib/services/profile-enhancement.service';
import { authenticateApiRequest } from '@/lib/utils/api-auth.utils';
import { ServiceFactory } from '@/lib/factories/service.factory';

const profileService = new ProfileEnhancementService();

/**
 * POST /api/profile/avatar
 * Upload user avatar
 */
export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Reject oversized files with a clear 400 before hitting the service
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Upload avatar
    const avatarUrl = await profileService.uploadAvatar(user.id, file);

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully',
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);

    // Return 400 for validation errors, 500 for everything else
    const isValidation =
      error.message?.includes('size') ||
      error.message?.includes('type') ||
      error.message?.includes('limit');

    return NextResponse.json(
      { error: error.message || 'Failed to upload avatar' },
      { status: isValidation ? 400 : 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 * Delete user avatar
 */
export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete avatar
    await profileService.deleteAvatar(user.id);

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully',
    });
  } catch (error: any) {
    console.error('Avatar deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
