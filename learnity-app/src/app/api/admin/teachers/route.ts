/**
 * Admin Teachers Management API
 * Handles teacher application management for administrators
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus, UserRole as PrismaUserRole } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/config/firebase-admin';
import { withAdminApiAuth } from '@/lib/utils/api-auth.utils';

// Validation schemas
const teacherActionSchema = z.object({
  teacherId: z.string(),
  action: z.enum(['approve', 'reject']),
});

type AuthenticatedAdmin = {
  firebaseUid: string;
};

/**
 * GET /api/admin/teachers
 * Fetch all teachers and applications with stats
 */
async function handleGetTeachers(
  request: NextRequest,
  user: AuthenticatedAdmin
): Promise<NextResponse> {
  try {
    console.debug('[AdminTeachers] request received', {
      url: request.url,
      admin: user.firebaseUid,
    });
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause for teachers
    const where: Prisma.UserWhereInput = {
      role: {
        in: [
          PrismaUserRole.TEACHER,
          PrismaUserRole.PENDING_TEACHER,
          PrismaUserRole.REJECTED_TEACHER,
        ],
      },
    };

    if (status && status !== 'all') {
      switch (status) {
        case 'pending':
          where.role = PrismaUserRole.PENDING_TEACHER;
          break;
        case 'approved':
          where.role = PrismaUserRole.TEACHER;
          break;
        case 'rejected':
          where.role = PrismaUserRole.REJECTED_TEACHER;
          break;
      }
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch teachers with their profiles
    const [teachers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          profilePicture: true,
          // Include teacher profile if exists
          teacherProfile: {
            select: {
              bio: true,
              subjects: true,
              experience: true,
              education: true,
              certifications: true,
              hourlyRate: true,
              availability: true,
              rating: true,
              lessonsCompleted: true,
              applicationStatus: true,
              submittedAt: true,
              reviewedAt: true,
              approvedBy: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Flatten teacher data with profile information
    const teachersWithProfiles = teachers.map(teacher => ({
      ...teacher,
      bio: teacher.teacherProfile?.bio,
      expertise: teacher.teacherProfile?.subjects || [], // Use subjects as expertise
      experience: teacher.teacherProfile?.experience,
      education: teacher.teacherProfile?.education,
      certifications: teacher.teacherProfile?.certifications || [],
      hourlyRate: teacher.teacherProfile?.hourlyRate,
      availability: teacher.teacherProfile?.availability,
      rating: teacher.teacherProfile?.rating || 0,
      totalSessions: teacher.teacherProfile?.lessonsCompleted || 0, // Use lessonsCompleted
      applicationStatus: teacher.teacherProfile?.applicationStatus,
      applicationDate: teacher.teacherProfile?.submittedAt, // Use submittedAt
      reviewedAt: teacher.teacherProfile?.reviewedAt,
      reviewedBy: teacher.teacherProfile?.approvedBy,
    }));

    // Calculate statistics
    const [
      pendingApplications,
      approvedTeachers,
      rejectedApplications,
      averageRatingResult,
      totalSessionsResult,
    ] = await Promise.all([
      prisma.user.count({ where: { role: PrismaUserRole.PENDING_TEACHER } }),
      prisma.user.count({ where: { role: PrismaUserRole.TEACHER } }),
      prisma.user.count({ where: { role: PrismaUserRole.REJECTED_TEACHER } }),
      prisma.teacherProfile.aggregate({
        where: { user: { role: PrismaUserRole.TEACHER } },
        _avg: { rating: true },
      }),
      prisma.teacherProfile.aggregate({
        where: { user: { role: PrismaUserRole.TEACHER } },
        _sum: { lessonsCompleted: true },
      }),
    ]);

    const averageRatingValue = averageRatingResult._avg.rating
      ? Number(averageRatingResult._avg.rating)
      : 0;
    const totalSessionsValue = totalSessionsResult._sum.lessonsCompleted
      ? Number(totalSessionsResult._sum.lessonsCompleted)
      : 0;

    const stats = {
      totalTeachers:
        pendingApplications + approvedTeachers + rejectedApplications,
      pendingApplications,
      approvedTeachers,
      rejectedApplications,
      averageRating: averageRatingValue,
      totalSessions: totalSessionsValue,
    };

    return NextResponse.json({
      success: true,
      teachers: teachersWithProfiles,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Admin teachers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/teachers
 * Approve or reject teacher applications
 */
async function handleUpdateTeacher(
  request: NextRequest,
  user: AuthenticatedAdmin
): Promise<NextResponse> {
  try {
    console.debug('[AdminTeachers] update request received', {
      url: request.url,
      admin: user.firebaseUid,
    });
    const body = await request.json();

    // Validate request body
    const validationResult = teacherActionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { teacherId, action } = validationResult.data;

    // Find the teacher
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacherProfile: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (teacher.role !== PrismaUserRole.PENDING_TEACHER) {
      return NextResponse.json(
        { error: 'Teacher application is not pending' },
        { status: 400 }
      );
    }

    // Update user role and teacher profile
    const newRole =
      action === 'approve'
        ? PrismaUserRole.TEACHER
        : PrismaUserRole.REJECTED_TEACHER;
    const applicationStatus =
      action === 'approve'
        ? ApplicationStatus.APPROVED
        : ApplicationStatus.REJECTED;

    await prisma.$transaction(async tx => {
      // Update user role
      await tx.user.update({
        where: { id: teacherId },
        data: { role: newRole },
      });

      // Update teacher profile if it exists
      if (teacher.teacherProfile) {
        await tx.teacherProfile.update({
          where: { userId: teacherId },
          data: {
            applicationStatus,
            reviewedAt: new Date(),
            approvedBy: user.firebaseUid,
          },
        });
      }

      // Update Firebase custom claims
      try {
        await adminAuth.setCustomUserClaims(teacher.firebaseUid, {
          role: newRole,
          profileComplete: true,
          emailVerified: teacher.emailVerified,
          profileId: teacher.id,
          lastLoginAt: teacher.lastLoginAt?.toISOString(),
        });
      } catch (firebaseError) {
        console.error('Failed to update Firebase claims:', firebaseError);
        // Don't fail the transaction for Firebase errors
      }
    });

    return NextResponse.json({
      success: true,
      message: `Teacher application ${action}d successfully`,
    });
  } catch (error) {
    console.error('Admin teacher action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform teacher action' },
      { status: 500 }
    );
  }
}

export const GET = withAdminApiAuth(handleGetTeachers);
export const PUT = withAdminApiAuth(handleUpdateTeacher);
