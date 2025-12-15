/**
 * YouTube Validation API Route
 * POST /api/youtube/validate - Validate YouTube URL and return video metadata
 * 
 * Requirements covered:
 * - 1.8: Validating YouTube URLs and extracting video metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { lessonService } from '@/lib/services/lesson.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';
import { z } from 'zod';

/**
 * Validation schema for YouTube URL request
 */
const ValidateYouTubeSchema = z.object({
  url: z.string().min(1, 'YouTube URL is required'),
});

/**
 * POST /api/youtube/validate
 * Validate YouTube URL and return video metadata (Teacher only)
 * Requirements: 1.8
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate and verify teacher role
    const authResult = await authMiddleware(request, {
      allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN],
    });

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const parseResult = ValidateYouTubeSchema.safeParse(body);
    if (!parseResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'YouTube URL is required',
        parseResult.error.flatten(),
        400
      );
    }

    const { url } = parseResult.data;

    // Validate YouTube URL and fetch metadata
    const result = await lessonService.validateYouTubeUrl(url);

    if (!result.isValid) {
      return createErrorResponse(
        'INVALID_YOUTUBE_URL',
        result.error || 'Invalid YouTube URL',
        undefined,
        400
      );
    }

    return createSuccessResponse(
      {
        isValid: result.isValid,
        videoId: result.videoId,
        metadata: result.metadata,
      },
      'YouTube URL validated successfully'
    );
  } catch (error) {
    console.error('Error validating YouTube URL:', error);
    return createInternalErrorResponse('Failed to validate YouTube URL');
  }
}
