/**
 * Course API Routes
 * GET /api/courses - List published courses with filters, search, pagination
 * POST /api/courses - Create new course (Teacher only)
 * 
 * Requirements covered:
 * - 1.1-1.10: Course creation
 * - 3.1, 3.2, 3.3, 3.4: Course discovery and browsing
 */

import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '@/lib/services/course.service';
import { CourseFiltersSchema, CreateCourseSchema } from '@/lib/validators/course';
import { CourseError } from '@/lib/interfaces/course.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createAuthErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';
import { ZodError } from 'zod';

/**
 * GET /api/courses
 * List published courses with filters, search, and pagination
 * If teacherOnly=true, returns all courses for the authenticated teacher
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if teacher is requesting their own courses
    const teacherOnly = searchParams.get('teacherOnly') === 'true';
    
    if (teacherOnly) {
      // Authenticate teacher
      const authResult = await authMiddleware(request, {
        allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN],
      });

      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const { user } = authResult;

      // Get user from database
      const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: user.firebaseUid },
        select: { id: true },
      });

      if (!dbUser) {
        return createAuthErrorResponse('User not found in database');
      }

      // Get teacher's courses
      const courses = await courseService.getCoursesByTeacher(dbUser.id);
      
      return createSuccessResponse(
        { courses, total: courses.length },
        'Teacher courses retrieved successfully'
      );
    }
    
    // Parse query parameters for public course listing
    const rawFilters = {
      categoryId: searchParams.get('categoryId') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      minRating: searchParams.get('minRating') 
        ? parseFloat(searchParams.get('minRating')!) 
        : undefined,
      isFree: searchParams.get('isFree') 
        ? searchParams.get('isFree') === 'true' 
        : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'popular',
      page: searchParams.get('page') 
        ? parseInt(searchParams.get('page')!, 10) 
        : 1,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!, 10) 
        : 12,
    };

    // Validate filters
    const validatedFilters = CourseFiltersSchema.parse(rawFilters);

    // Get courses based on search or filters
    let result;
    if (validatedFilters.search) {
      result = await courseService.searchCourses(
        validatedFilters.search, 
        validatedFilters
      );
    } else {
      result = await courseService.getPublishedCourses(validatedFilters);
    }

    return createSuccessResponse(result, 'Courses retrieved successfully');
  } catch (error) {
    console.error('Error fetching courses:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid filter parameters');
    }

    return createInternalErrorResponse('Failed to fetch courses');
  }
}

/**
 * POST /api/courses
 * Create a new course (Teacher only)
 * Requirements: 1.1-1.10
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

    const { user } = authResult;

    // Get user from database to get the user ID
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Verify user is a teacher
    if (dbUser.role !== 'TEACHER' && dbUser.role !== 'ADMIN') {
      return createErrorResponse(
        'FORBIDDEN',
        'Only teachers can create courses',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = CreateCourseSchema.parse(body);

    // Create course
    const course = await courseService.createCourse(dbUser.id, validatedData);

    return createSuccessResponse(
      course,
      'Course created successfully',
      undefined,
      201
    );
  } catch (error) {
    console.error('Error creating course:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid course data');
    }

    if (error instanceof CourseError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to create course');
  }
}
