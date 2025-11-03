/**
 * API Route: Social Registration
 * Creates user profile for social login users (Google, Microsoft)
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database.service';
import { UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firebaseUid = request.headers.get('X-Firebase-UID');
    
    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Firebase UID is required' },
        { status: 401 }
      );
    }

    console.log('Creating social user profile for:', body.email);
    
    // Initialize database service
    const databaseService = new DatabaseService();
    
    // Split name into first/last
    const names = body.name.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    
    // Create user profile in Neon DB
    const userProfile = await databaseService.createUserProfile(firebaseUid, {
      email: body.email,
      firstName,
      lastName,
      role: UserRole.STUDENT, // Default role
      emailVerified: true, // Social logins are verified
      profilePicture: body.photoURL
    });

    console.log('✅ Social user profile created:', userProfile.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Social user profile created',
      userId: userProfile.id
    });
  } catch (error: any) {
    console.error('❌ Social registration failed:', error);
    return NextResponse.json(
      { error: 'Social registration failed', details: error.message },
      { status: 500 }
    );
  }
}
