import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

/**
 * Admin API for managing teacher applications
 * GET: Fetch all pending teacher applications
 * PATCH: Update teacher application status
 */

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const customClaims = decodedToken.customClaims;
    if (customClaims?.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch all teacher applications with user data
    const teachers = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.PENDING_TEACHER, UserRole.TEACHER]
        }
      },
      include: {
        teacherProfile: {
          include: {
            subjects: true,
            qualifications: true,
            certifications: true,
            documents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data for admin dashboard
    const transformedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      status: teacher.role === UserRole.PENDING_TEACHER ? 'pending' : 'approved',
      submittedAt: teacher.createdAt.toISOString(),
      profileComplete: calculateProfileCompletion(teacher.teacherProfile),
      subjects: teacher.teacherProfile?.subjects?.map(s => s.name) || [],
      experience: teacher.teacherProfile?.yearsOfExperience || 'Not specified',
      documents: teacher.teacherProfile?.documents?.length || 0,
      videoIntro: !!teacher.teacherProfile?.videoIntroUrl,
      bio: teacher.teacherProfile?.bio,
      qualifications: teacher.teacherProfile?.qualifications?.length || 0,
      certifications: teacher.teacherProfile?.certifications?.length || 0,
      hourlyRate: teacher.teacherProfile?.hourlyRate,
      linkedinUrl: teacher.teacherProfile?.linkedinUrl,
      profilePicture: teacher.teacherProfile?.profilePicture
    }));

    return NextResponse.json({
      success: true,
      teachers: transformedTeachers,
      total: transformedTeachers.length,
      pending: transformedTeachers.filter(t => t.status === 'pending').length,
      approved: transformedTeachers.filter(t => t.status === 'approved').length
    });

  } catch (error) {
    console.error('Admin teachers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const customClaims = decodedToken.customClaims;
    if (customClaims?.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { teacherId, action, reason } = await request.json();

    if (!teacherId || !action) {
      return NextResponse.json({ error: 'Teacher ID and action are required' }, { status: 400 });
    }

    // Find the teacher
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacherProfile: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    let newRole: UserRole;
    let statusMessage: string;

    switch (action) {
      case 'approve':
        newRole = UserRole.TEACHER;
        statusMessage = 'Teacher application approved';
        break;
      case 'reject':
        newRole = UserRole.REJECTED_TEACHER;
        statusMessage = 'Teacher application rejected';
        break;
      case 'review':
        // Keep as pending but mark as under review
        newRole = UserRole.PENDING_TEACHER;
        statusMessage = 'Teacher application under review';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update user role
    const updatedTeacher = await prisma.user.update({
      where: { id: teacherId },
      data: { 
        role: newRole,
        updatedAt: new Date()
      }
    });

    // Update Firebase custom claims if approving
    if (action === 'approve') {
      await adminAuth.setCustomUserClaims(teacher.firebaseUid, {
        role: UserRole.TEACHER,
        approved: true,
        approvedAt: new Date().toISOString()
      });
    }

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId: decodedToken.uid,
        action: `teacher_${action}`,
        targetUserId: teacherId,
        details: {
          reason: reason || null,
          previousRole: teacher.role,
          newRole: newRole
        }
      }
    });

    // TODO: Send email notification to teacher
    // await sendTeacherStatusEmail(teacher.email, action, reason);

    return NextResponse.json({
      success: true,
      message: statusMessage,
      teacher: {
        id: updatedTeacher.id,
        role: updatedTeacher.role,
        status: action
      }
    });

  } catch (error) {
    console.error('Admin teacher update error:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher status' },
      { status: 500 }
    );
  }
}

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  const fields = [
    profile.bio,
    profile.profilePicture,
    profile.videoIntroUrl,
    profile.yearsOfExperience,
    profile.hourlyRate,
    profile.linkedinUrl,
    profile.teachingApproach,
    profile.subjects?.length > 0,
    profile.qualifications?.length > 0,
    profile.certifications?.length > 0,
    profile.documents?.length > 0,
    profile.availableDays?.length > 0
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}