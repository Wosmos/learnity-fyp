/**
 * Admin Users Management API
 * Handles user management operations for administrators
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { withAdminApiAuth } from '@/lib/utils/api-auth.utils';

// Validation schemas
const userActionSchema = z.object({
  userId: z.string(),
  action: z.enum(['activate', 'deactivate', 'delete'])
});

type AuthenticatedAdmin = {
  firebaseUid: string;
};

const ensureActiveAdmin = async (firebaseUid: string) => {
  const adminUser = await prisma.user.findUnique({
    where: { firebaseUid },
    select: { role: true, isActive: true }
  });

  if (!adminUser || !adminUser.isActive || adminUser.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  return null;
};

async function handleGetUsers(request: NextRequest, user: AuthenticatedAdmin): Promise<NextResponse> {
  try {
    const adminCheck = await ensureActiveAdmin(user.firebaseUid);
    if (adminCheck) {
      return adminCheck;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Build where clause
    const where: Prisma.UserWhereInput = {};
    
    if (role && role !== 'all') {
      where.role = role as UserRole;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
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
          profilePicture: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

async function handleUpdateUser(request: NextRequest, user: AuthenticatedAdmin): Promise<NextResponse> {
  try {
    const adminCheck = await ensureActiveAdmin(user.firebaseUid);
    if (adminCheck) {
      return adminCheck;
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = userActionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { userId, action } = validationResult.data;

    // Find the user first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firebaseUid: true,
        isActive: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (action === 'delete' && existingUser.firebaseUid === user.firebaseUid) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Perform the action
    switch (action) {
      case 'activate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true }
        });
        break;

      case 'deactivate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        });
        break;

      case 'delete':
        // Soft delete - mark as inactive and anonymize data
        await prisma.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            email: `deleted_${userId}@deleted.com`,
            firstName: 'Deleted',
            lastName: 'User'
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`
    });

  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform user action' },
      { status: 500 }
    );
  }
}

export const GET = withAdminApiAuth(handleGetUsers);
export const PUT = withAdminApiAuth(handleUpdateUser);