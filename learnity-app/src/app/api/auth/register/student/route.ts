/**
 * API Route: Student Registration
 * Creates student profile after Firebase user creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { studentRegistrationSchema } from '@/lib/validators/auth';
import { DatabaseService } from '@/lib/services/database.service';
import { UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validatedData = studentRegistrationSchema.parse(body);

    // Get Firebase UID from Authorization header
    const authHeader = request.headers.get('Authorization');
    const firebaseUid = request.headers.get('X-Firebase-UID');

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Firebase UID is required. User must be authenticated.' },
        { status: 401 }
      );
    }

    console.log('Creating student profile for Firebase UID:', firebaseUid);

    // Initialize database service
    const databaseService = new DatabaseService();

    // Create user profile in Neon DB
    const userProfile = await databaseService.createUserProfile(firebaseUid, {
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: UserRole.STUDENT,
      emailVerified: false,
      studentProfile: {
        gradeLevel: validatedData.gradeLevel,
        subjects: validatedData.subjects,
        learningGoals: [],
        interests: [],
        studyPreferences: [],
        profileCompletionPercentage: 20,
      },
    });

    console.log(' Student profile created in database:', userProfile.id);

    // TODO: Set custom claims in Firebase using Firebase Admin SDK
    // This requires Firebase Admin SDK setup on the server

    return NextResponse.json({
      success: true,
      message: 'Student profile created successfully',
      userId: userProfile.id,
    });
  } catch (error: any) {
    console.error(' Student registration failed:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
