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
        userId: user.id,
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
        approvedBy: user.teacherProfile.approvedBy,
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

export async function PATCH(request: NextRequest) {
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
    
    // Get request body
    const body = await request.json();
    const { section, data } = body;

    // Find user to get IDs
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: { teacherProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Prepare update data
    let userUpdateData: any = {};
    let profileUpdateData: any = {};

    // Map data based on section
    // 'identity' section contains both User (name) and Profile fields
    if (section === 'identity') {
      if (data.firstName) userUpdateData.firstName = data.firstName;
      if (data.lastName) userUpdateData.lastName = data.lastName;
      
      const profileFields = ['headline', 'bio', 'videoIntroUrl', 'teachingApproach', 'whyChooseMe'];
      profileFields.forEach(field => {
        if (data[field] !== undefined) profileUpdateData[field] = data[field];
      });
    }
    // 'expertise' section is purely Profile
    else if (section === 'expertise') {
      const profileFields = [
        'subjects', 'specialties', 'languages', 'education', 
        'certifications', 'experience', 'onlineExperience', 'achievements'
      ];
      profileFields.forEach(field => {
        if (data[field] !== undefined) profileUpdateData[field] = data[field];
      });
    }
    // 'logistics' section is purely Profile
    else if (section === 'logistics') {
      const profileFields = [
        'hourlyRate', 'timezone', 'city', 'country', 'phone', 
        'websiteUrl', 'linkedinUrl', 'availability', 'availableDays', 'preferredTimes'
      ];
      profileFields.forEach(field => {
        if (data[field] !== undefined) profileUpdateData[field] = data[field];
      });
    }
    // Fallback/Legacy
    else {
       // Try to distribute fields intelligently
       if (data.firstName) userUpdateData.firstName = data.firstName;
       if (data.lastName) userUpdateData.lastName = data.lastName;
       
       // Everything else goes to profile data, excluding user fields
       profileUpdateData = { ...data };
       delete profileUpdateData.firstName;
       delete profileUpdateData.lastName;
    }

    // Transaction to update both tables if needed
    await prisma.$transaction(async (tx) => {
      // Update User table if we have fields
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: userUpdateData
        });
      }

      // Update TeacherProfile table
      if (Object.keys(profileUpdateData).length > 0) {
        await tx.teacherProfile.update({
          where: { id: user.teacherProfile!.id },
          data: profileUpdateData
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('❌ Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}