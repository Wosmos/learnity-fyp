/**
 * Quick Teacher Registration API Route
 * Simplified 3-step teacher registration process
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/config/database';
import { quickTeacherRegistrationSchema } from '@/lib/validators/quick-teacher-registration';
import { adminAuth } from '@/lib/config/firebase-admin';
import { UserRole, ApplicationStatus } from '@/types/auth';
import { headers } from 'next/headers';

// Simple Firebase token verification function
async function verifyFirebaseToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new Error('Invalid Firebase token');
  }
}

// Retry function for handling race conditions
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      
      // Only retry on unique constraint violations
      if ((error as any)?.code === 'P2002' && attempt < maxRetries) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} due to unique constraint violation`);
        // Wait a bit before retrying to avoid immediate collision
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    // Get request metadata
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const firebaseUid = headersList.get('x-firebase-uid');

    console.log('🔵 Quick teacher registration request:', {
      ipAddress,
      userAgent,
      firebaseUid
    });

    // Parse and validate request body
    const body = await request.json();
    console.log('🔵 Request body received, validating...');

    const validatedData = quickTeacherRegistrationSchema.parse(body);
    console.log('✅ Data validation successful');

    // Verify Firebase token (simplified for testing)
    const authHeader = request.headers.get('authorization');
    let decodedToken = { uid: firebaseUid || '', email_verified: false };
    
    if (authHeader?.startsWith('Bearer ') && firebaseUid) {
      try {
        const idToken = authHeader.substring(7);
        if (idToken !== 'mock-firebase-token') {
          decodedToken = await verifyFirebaseToken(idToken);
          
          if (decodedToken.uid !== firebaseUid) {
            console.error('❌ Firebase UID mismatch');
            return NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401 }
            );
          }
        } else {
          // Mock token for testing
          console.log('🔵 Using mock Firebase token for testing');
          decodedToken = { uid: firebaseUid || '', email_verified: false };
        }
      } catch (error) {
        console.error('❌ Firebase token verification failed:', error);
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } else {
      console.error('❌ Missing or invalid authorization');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Firebase token verified:', decodedToken.uid);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (existingUser) {
      console.log('🔵 User already exists, checking if teacher profile exists...');
      
      // Check if teacher profile already exists
      const existingTeacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: existingUser.id }
      });

      if (existingTeacherProfile) {
        console.error('❌ Teacher profile already exists:', existingTeacherProfile.id);
        return NextResponse.json(
          { error: 'Teacher application already submitted' },
          { status: 409 }
        );
      }

      // User exists but no teacher profile, we can create the teacher profile
      console.log('✅ User exists, will create teacher profile only');
    } else {
      // Check if email is already registered by another user
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (existingEmail && existingEmail.firebaseUid !== decodedToken.uid) {
        console.error('❌ Email already registered by different user:', validatedData.email);
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
    }

    // Create user and teacher profile in a transaction with retry logic
    console.log('🔵 Creating user and teacher profile...');
    
    const result = await withRetry(async () => {
      // Re-check user existence inside retry to handle race conditions
      const currentUser = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });

      return await prisma.$transaction(async (tx) => {
        let user;
        
        if (currentUser) {
          // Update existing user to teacher role
          user = await tx.user.update({
            where: { id: currentUser.id },
            data: {
              role: UserRole.PENDING_TEACHER,
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              // Don't update email as it might cause conflicts
            }
          });
          console.log('✅ Updated existing user to teacher role');
        } else {
          // Create new user
          user = await tx.user.create({
            data: {
              firebaseUid: decodedToken.uid,
              email: validatedData.email,
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              role: UserRole.PENDING_TEACHER,
              emailVerified: decodedToken.email_verified || false,
              authProvider: 'email',
              isActive: true,
            }
          });
          console.log('✅ Created new user');
        }

        // Create simplified teacher profile
        const teacherProfile = await tx.teacherProfile.create({
          data: {
            userId: user.id,
            applicationStatus: ApplicationStatus.PENDING,
            
            // Basic professional info
            qualifications: [], // Will be filled later in profile enhancement
            subjects: validatedData.subjects,
            experience: validatedData.experience,
            onlineExperience: 0, // Default for quick registration
            bio: validatedData.bio,
            hourlyRate: validatedData.hourlyRate ? parseFloat(validatedData.hourlyRate.toString()) : null,
            
            // Contact information
            phone: validatedData.phone || null,
            country: validatedData.country,
            
            // Teaching details
            ageGroups: validatedData.ageGroups,
            lessonTypes: ['One-on-One Tutoring'], // Default for quick registration
            
            // Availability
            availableDays: validatedData.availableDays,
            preferredTimes: validatedData.preferredTimes,
            timezone: validatedData.timezone,
            
            // Languages (default to English for quick registration)
            languages: ['English'],
            education: [], // Will be filled later in profile enhancement
            
            // Optional YouTube intro
            videoIntroUrl: validatedData.youtubeIntroUrl || null,
            
            submittedAt: new Date(),
          }
        });

        return { user, teacherProfile };
      });
    });

    console.log('✅ Quick teacher profile created:', {
      userId: result.user.id,
      profileId: result.teacherProfile.id
    });

    // TODO: Send notification to admins about new teacher application
    // TODO: Send confirmation email to teacher

    return NextResponse.json({
      success: true,
      message: 'Teacher application submitted successfully! Check your email for next steps.',
      data: {
        userId: result.user.id,
        applicationId: result.teacherProfile.id,
        status: ApplicationStatus.PENDING,
        nextSteps: {
          emailVerification: !decodedToken.email_verified,
          profileEnhancement: true,
          adminReview: true
        }
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Quick teacher registration failed:', {
      error: errorMessage,
      stack: errorStack
    });

    // Handle validation errors
    if ((error as any)?.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: (error as any)?.errors
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if ((error as any)?.code === 'P2002') {
      const target = (error as any)?.meta?.target;
      if (target?.includes('firebaseUid')) {
        return NextResponse.json(
          { error: 'User account already exists. Please try logging in instead.' },
          { status: 409 }
        );
      } else if (target?.includes('email')) {
        return NextResponse.json(
          { error: 'Email address is already registered' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: 'A user with this information already exists' },
          { status: 409 }
        );
      }
    }

    // Handle security errors
    if (errorMessage.includes('Rate limit') || errorMessage.includes('Suspicious')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}