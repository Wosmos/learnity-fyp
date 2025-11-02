/**
 * API Route: Get User Profile
 * Fetches user profile data from Neon DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database.service';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function GET(request: NextRequest) {
  const databaseService = new DatabaseService();

  try {
    // Verify Firebase ID token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const userProfile = await databaseService.getUserProfile(decodedToken.uid);

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
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
          profileCompletionPercentage: userProfile.studentProfile.profileCompletionPercentage,
          interests: userProfile.studentProfile.interests,
          academicLevel: userProfile.studentProfile.academicLevel,
          preferredSubjects: userProfile.studentProfile.preferredSubjects
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

    return NextResponse.json({
      success: true,
      data: profileData
    });

  } catch (error: any) {
    console.error('Get profile error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROFILE_FETCH_FAILED',
          message: 'Failed to fetch user profile'
        }
      },
      { status: 500 }
    );
  } finally {
    await databaseService.disconnect();
  }
}

export async function PUT(request: NextRequest) {
  const databaseService = new DatabaseService();

  try {
    // Verify Firebase ID token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse request body
    const updateData = await request.json();

    // Update user profile
    const updatedProfile = await databaseService.updateUserProfile(
      decodedToken.uid,
      updateData
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });

  } catch (error: any) {
    console.error('Update profile error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: 'Failed to update user profile'
        }
      },
      { status: 500 }
    );
  } finally {
    await databaseService.disconnect();
  }
}