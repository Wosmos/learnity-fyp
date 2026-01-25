/**
 * API Route: Teacher Registration
 * Creates teacher application after Firebase user creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherRegistrationSchema } from '@/lib/validators/auth';
import { UserRole, ApplicationStatus } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validatedData = teacherRegistrationSchema.parse(body);

    // Create teacher application
    const teacherApplication = {
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: UserRole.PENDING_TEACHER,
      qualifications: validatedData.qualifications,
      subjects: validatedData.subjects,
      experience: validatedData.experience,
      bio: validatedData.bio,
      hourlyRate: validatedData.hourlyRate,
      applicationStatus: ApplicationStatus.PENDING,
      emailVerified: false,
      isActive: true,
      submittedAt: new Date(),
    };

    // Note: In a real implementation, you would:
    // 1. Get the Firebase UID from the authenticated user
    // 2. Create the teacher application in your database
    // 3. Set custom claims in Firebase (PENDING_TEACHER role)
    // 4. Handle document uploads

    console.log('Teacher application data:', teacherApplication);

    return NextResponse.json({
      success: true,
      message: 'Teacher application submitted successfully',
    });
  } catch (error: any) {
    console.error('Teacher registration failed:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 400 }
    );
  }
}
