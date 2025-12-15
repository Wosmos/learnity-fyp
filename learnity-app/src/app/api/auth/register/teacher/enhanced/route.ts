/**
 * Enhanced Teacher Registration API Route
 * Handles comprehensive teacher application with rich profile data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/config/database';
import { enhancedTeacherRegistrationSchema } from '@/lib/validators/auth';
import { adminAuth } from '@/lib/config/firebase-admin';
// import { AuditLogger } from '@/lib/services/audit.service';
// import { SecurityService } from '@/lib/services/security.service';
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
  // const auditLogger = new AuditLogger();
  // const securityService = new SecurityService();
  
  try {
    // Get request metadata
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const firebaseUid = headersList.get('x-firebase-uid');

    console.log('🔵 Enhanced teacher registration request:', {
      ipAddress,
      userAgent,
      firebaseUid
    });

    // Security checks (temporarily disabled for testing)
    // await securityService.checkRateLimit(ipAddress, 'teacher-registration', 3, 3600); // 3 per hour
    // await securityService.detectSuspiciousActivity(ipAddress, userAgent);

    // Parse and validate request body
    const body = await request.json();
    console.log('🔵 Request body received, validating...');

    const validatedData = enhancedTeacherRegistrationSchema.parse(body);
    console.log('✅ Data validation successful');

    // Verify Firebase token (simplified for testing)
    const authHeader = request.headers.get('authorization');
    let decodedToken: { uid: string; email_verified: boolean } = { 
      uid: firebaseUid || '', 
      email_verified: false 
    };
    
    if (authHeader?.startsWith('Bearer ') && firebaseUid) {
      try {
        const idToken = authHeader.substring(7);
        if (idToken !== 'mock-firebase-token') {
          const firebaseToken = await verifyFirebaseToken(idToken);
          
          if (firebaseToken.uid !== firebaseUid) {
            console.error('❌ Firebase UID mismatch');
            return NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401 }
            );
          }
          
          decodedToken = {
            uid: firebaseToken.uid,
            email_verified: firebaseToken.email_verified || false
          };
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
              firebaseUid: decodedToken.uid || firebaseUid || '',
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

        // Create enhanced teacher profile
        const teacherProfile = await tx.teacherProfile.create({
        data: {
          userId: user.id,
          applicationStatus: ApplicationStatus.PENDING,
          
          // Basic professional info
          qualifications: validatedData.qualifications,
          subjects: validatedData.subjects,
          experience: validatedData.experience,
          onlineExperience: validatedData.onlineExperience || 0,
          bio: validatedData.bio,
          headline: validatedData.headline || null,
          teachingApproach: validatedData.teachingApproach || null,
          hourlyRate: validatedData.hourlyRate ? parseFloat(validatedData.hourlyRate.toString()) : null,
          
          // Contact information
          phone: validatedData.phone || null,
          address: validatedData.address || null,
          city: validatedData.city || null,
          state: validatedData.state || null,
          country: validatedData.country,
          zipCode: validatedData.zipCode || null,
          
          // Personal information
          dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
          gender: validatedData.gender || null,
          
          // Teaching details
          teachingMethods: validatedData.teachingMethods || [],
          ageGroups: validatedData.ageGroups,
          lessonTypes: validatedData.lessonTypes,
          technologySkills: validatedData.technologySkills || [],
          
          // Availability
          availableDays: validatedData.availableDays,
          preferredTimes: validatedData.preferredTimes,
          timezone: validatedData.timezone,
          minSessionLength: validatedData.minSessionLength || null,
          maxSessionLength: validatedData.maxSessionLength || null,
          
          // Languages and education
          languages: validatedData.languages,
          education: validatedData.education,
          certifications: validatedData.certifications || [],
          specialties: validatedData.specialties || [],
          achievements: validatedData.achievements || [],
          
          // Personal interests
          personalInterests: validatedData.personalInterests || [],
          hobbies: validatedData.hobbies || [],
          
          // Social media and professional links
          linkedinUrl: validatedData.linkedinUrl || null,
          websiteUrl: validatedData.websiteUrl || null,
          youtubeUrl: validatedData.youtubeUrl || null,
          
          // Emergency contact
          emergencyContactName: validatedData.emergencyContactName || null,
          emergencyContactPhone: validatedData.emergencyContactPhone || null,
          emergencyContactRelation: validatedData.emergencyContactRelation || null,
          
          // Preferences
          communicationPreference: validatedData.communicationPreference || null,
          whyChooseMe: validatedData.whyChooseMe || [],
          
          // Media URLs (if uploaded)
          profilePicture: (body as any).profilePictureUrl || null,
          bannerImage: (body as any).bannerImageUrl || null,
          videoIntroUrl: (body as any).videoIntroUrl || null,
          documents: (body as any).documentUrls || [],
          
          submittedAt: new Date(),
        }
      });

        return { user, teacherProfile };
      });
    });

    console.log('✅ Enhanced teacher profile created:', {
      userId: result.user.id,
      profileId: result.teacherProfile.id
    });

    // Log successful registration (temporarily disabled for testing)
    // await auditLogger.logEvent({
    //   userId: result.user.id,
    //   firebaseUid: decodedToken.uid,
    //   eventType: 'TEACHER_APPLICATION_SUBMIT',
    //   action: 'Enhanced teacher application submitted',
    //   resource: 'teacher_profiles',
    //   newValues: {
    //     applicationId: result.teacherProfile.id,
    //     subjects: validatedData.subjects,
    //     experience: validatedData.experience,
    //     country: validatedData.country
    //   },
    //   ipAddress,
    //   userAgent,
    //   success: true
    // });

    // TODO: Send notification to admins about new teacher application
    // TODO: Send confirmation email to teacher

    return NextResponse.json({
      success: true,
      message: 'Enhanced teacher application submitted successfully',
      data: {
        userId: result.user.id,
        applicationId: result.teacherProfile.id,
        status: ApplicationStatus.PENDING
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Enhanced teacher registration failed:', {
      error: errorMessage,
      stack: errorStack
    });

    // Log failed registration attempt (temporarily disabled for testing)
    // await auditLogger.logEvent({
    //   eventType: 'TEACHER_APPLICATION_SUBMIT',
    //   action: 'Enhanced teacher application failed',
    //   resource: 'teacher_profiles',
    //   ipAddress: request.ip || 'unknown',
    //   userAgent: request.headers.get('user-agent') || 'unknown',
    //   success: false,
    //   errorMessage: errorMessage
    // });

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