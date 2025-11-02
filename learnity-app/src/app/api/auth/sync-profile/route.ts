/**
 * API Route: Sync User Profile
 * Automatically creates or updates user profile in Neon DB when user authenticates
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database.service';
import { RoleManagerService } from '@/lib/services/role-manager.service';
import { adminAuth } from '@/lib/config/firebase-admin';
import { UserRole, Permission, EventType } from '@/types/auth';
import { z } from 'zod';
import { createHash } from 'crypto';

// Validation schema for sync profile request
const syncProfileSchema = z.object({
  uid: z.string().min(1, 'Firebase UID is required'),
  email: z.string().email('Valid email is required'),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable().optional(),
  emailVerified: z.boolean(),
  providerData: z.array(z.object({
    providerId: z.string(),
    uid: z.string(),
    displayName: z.string().nullable(),
    email: z.string().nullable(),
    photoURL: z.string().nullable()
  })).optional()
});

export async function POST(request: NextRequest) {
  const databaseService = new DatabaseService();
  const roleManagerService = new RoleManagerService();

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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = syncProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const userData = validationResult.data;

    // Verify the UID matches the token
    if (userData.uid !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'UID mismatch' },
        { status: 403 }
      );
    }

    // Get client information for audit logging
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if user profile already exists
    let userProfile = await databaseService.getUserProfile(userData.uid);
    let isNewUser = false;

    if (!userProfile) {
      // Create new user profile
      isNewUser = true;
      
      // Determine if this is a social login
      const isSocialLogin = userData.providerData?.some(
        provider => provider.providerId === 'google.com' || provider.providerId === 'microsoft.com'
      ) || false;

      // Split display name into first and last name
      const names = userData.displayName?.split(' ') || [];
      const firstName = names[0] || 'User';
      const lastName = names.slice(1).join(' ') || '';

      // Create user profile with default role
      userProfile = await databaseService.createUserProfile(userData.uid, {
        firstName,
        lastName,
        email: userData.email,
        role: UserRole.STUDENT, // Default role for new users
        emailVerified: userData.emailVerified,
        profilePicture: userData.photoURL || undefined,
        authProvider: isSocialLogin ? 'social' : 'email',
        socialProviders: userData.providerData?.map(p => p.providerId) || []
      });

      // Set initial custom claims
      await roleManagerService.setCustomClaims(userData.uid, {
        role: UserRole.STUDENT,
        permissions: [
          Permission.VIEW_STUDENT_DASHBOARD,
          Permission.JOIN_STUDY_GROUPS,
          Permission.BOOK_TUTORING,
          Permission.ENHANCE_PROFILE
        ],
        profileComplete: false,
        emailVerified: userData.emailVerified,
        profileId: userProfile.id
      });

      // Log new user creation
      await logAuditEvent(databaseService, {
        eventType: EventType.PROFILE_UPDATE,
        action: 'profile_created_on_auth',
        firebaseUid: userData.uid,
        ipAddress: clientIP,
        userAgent,
        success: true,
        metadata: {
          email: userData.email,
          isNewUser: true,
          isSocialLogin,
          providers: userData.providerData?.map(p => p.providerId) || ['email'],
          createdFromAuth: true
        }
      });

      console.log('✅ New user profile created:', {
        uid: userData.uid,
        email: userData.email,
        profileId: userProfile.id,
        isSocialLogin
      });

    } else {
      // Update existing profile with latest Firebase data
      const updateData: any = {
        emailVerified: userData.emailVerified,
        lastLoginAt: new Date()
      };

      // Update profile picture if not set and available from Firebase
      if (!userProfile.profilePicture && userData.photoURL) {
        updateData.profilePicture = userData.photoURL;
      }

      // Update social providers if changed
      const currentProviders = userProfile.socialProviders || [];
      const newProviders = userData.providerData?.map(p => p.providerId) || [];
      if (JSON.stringify(currentProviders.sort()) !== JSON.stringify(newProviders.sort())) {
        updateData.socialProviders = newProviders;
      }

      userProfile = await databaseService.updateUserProfile(userData.uid, updateData);

      // Update custom claims with latest profile data
      await roleManagerService.setCustomClaims(userData.uid, {
        role: userProfile.role as UserRole,
        permissions: await roleManagerService.getRolePermissions(userProfile.role as UserRole),
        profileComplete: calculateProfileCompletion(userProfile),
        emailVerified: userProfile.emailVerified,
        lastLoginAt: new Date().toISOString(),
        profileId: userProfile.id
      });

      // Log profile sync
      await logAuditEvent(databaseService, {
        eventType: EventType.PROFILE_UPDATE,
        action: 'profile_synced_on_auth',
        firebaseUid: userData.uid,
        ipAddress: clientIP,
        userAgent,
        success: true,
        metadata: {
          email: userData.email,
          profileId: userProfile.id,
          updatedFields: Object.keys(updateData),
          providers: newProviders
        }
      });

      console.log('✅ User profile synced:', {
        uid: userData.uid,
        email: userData.email,
        profileId: userProfile.id,
        updatedFields: Object.keys(updateData)
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        profileId: userProfile.id,
        isNewUser,
        role: userProfile.role,
        emailVerified: userProfile.emailVerified,
        profileComplete: calculateProfileCompletion(userProfile)
      }
    });

  } catch (error: any) {
    console.error('Profile sync error:', error);

    // Log error
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await logAuditEvent(databaseService, {
        eventType: EventType.PROFILE_UPDATE,
        action: 'profile_sync_error',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: error.message,
        metadata: {
          errorStack: error.stack
        }
      });
    } catch (logError) {
      console.error('Failed to log audit event:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROFILE_SYNC_FAILED',
          message: 'Failed to sync user profile'
        }
      },
      { status: 500 }
    );
  } finally {
    await databaseService.disconnect();
  }
}

/**
 * Calculate profile completion status
 */
function calculateProfileCompletion(userProfile: any): boolean {
  if (userProfile.role === 'STUDENT') {
    return userProfile.studentProfile?.profileCompletionPercentage >= 80;
  } else if (userProfile.role === 'TEACHER') {
    return userProfile.teacherProfile?.applicationStatus === 'APPROVED';
  } else if (userProfile.role === 'ADMIN') {
    return true;
  }
  return false;
}

/**
 * Helper function to log audit events
 */
async function logAuditEvent(
  databaseService: DatabaseService,
  event: {
    eventType: EventType;
    action: string;
    firebaseUid?: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    const prisma = (databaseService as any).prisma;
    
    await prisma.auditLog.create({
      data: {
        firebaseUid: event.firebaseUid,
        eventType: event.eventType,
        action: event.action,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        deviceFingerprint: generateDeviceFingerprint(event.userAgent, event.ipAddress),
        success: event.success,
        errorMessage: event.errorMessage,
        metadata: event.metadata || {}
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Generate device fingerprint
 */
function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  return createHash('sha256')
    .update(`${userAgent}:${ipAddress}`)
    .digest('hex')
    .substring(0, 16);
}