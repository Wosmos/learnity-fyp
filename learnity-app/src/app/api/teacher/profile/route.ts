/**
 * Teacher Profile API Route
 * Fetches teacher profile data for pending/approved teachers
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/config/database';
import { adminAuth } from '@/lib/config/firebase-admin';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify Firebase token
    const idToken = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    console.log('🔵 Fetching teacher profile for:', decodedToken.uid);

    // Find user and teacher profile
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        teacherProfile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.teacherProfile) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Teacher profile found:', user.teacherProfile.id);

    return NextResponse.json({
      success: true,
      profile: {
        id: user.teacherProfile.id,
        applicationStatus: user.teacherProfile.applicationStatus,
        subjects: user.teacherProfile.subjects,
        experience: user.teacherProfile.experience,
        bio: user.teacherProfile.bio,
        hourlyRate: user.teacherProfile.hourlyRate,
        qualifications: user.teacherProfile.qualifications,
        certifications: user.teacherProfile.certifications,
        education: user.teacherProfile.education,
        ageGroups: user.teacherProfile.ageGroups,
        lessonTypes: user.teacherProfile.lessonTypes,
        availableDays: user.teacherProfile.availableDays,
        preferredTimes: user.teacherProfile.preferredTimes,
        timezone: user.teacherProfile.timezone,
        languages: user.teacherProfile.languages,
        teachingApproach: user.teacherProfile.teachingApproach,
        specialties: user.teacherProfile.specialties,
        achievements: user.teacherProfile.achievements,
        personalInterests: user.teacherProfile.personalInterests,
        profilePicture: user.teacherProfile.profilePicture,
        bannerImage: user.teacherProfile.bannerImage,
        videoIntroUrl: user.teacherProfile.videoIntroUrl,
        documents: user.teacherProfile.documents,
        linkedinUrl: user.teacherProfile.linkedinUrl,
        websiteUrl: user.teacherProfile.websiteUrl,
        youtubeUrl: user.teacherProfile.youtubeUrl,
        submittedAt: user.teacherProfile.submittedAt,
        reviewedAt: user.teacherProfile.reviewedAt,
        approvedAt: user.teacherProfile.approvedAt,
        // User info
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.teacherProfile.phone,
        country: user.teacherProfile.country,
        city: user.teacherProfile.city,
        state: user.teacherProfile.state
      }
    });

  } catch (error: unknown) {
    console.error('❌ Failed to fetch teacher profile:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}