/**
 * Featured Teachers API
 * Returns approved teachers for public display
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/config/database';

// Helper to calculate if teacher is top rated
function calculateIsTopRated(rating: number, reviewCount: number, lessonsCompleted: number, experience: number): boolean {
  return rating >= 4.8 && reviewCount >= 80 && lessonsCompleted >= 400 && experience >= 5;
}

export async function GET() {
  try {
    // Fetch approved teachers with their profiles
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        isActive: true,
        teacherProfile: {
          applicationStatus: 'APPROVED',
        },
      },
      include: {
        teacherProfile: true,
      },
      take: 50,
      orderBy: {
        teacherProfile: {
          rating: 'desc',
        },
      },
    });

    // Format the response with calculated isTopRated
    const formattedTeachers = teachers.map((teacher) => {
      const profile = teacher.teacherProfile;
      const rating = parseFloat(profile?.rating?.toString() || '0');
      const isTopRated = calculateIsTopRated(
        rating,
        profile?.reviewCount || 0,
        profile?.lessonsCompleted || 0,
        profile?.experience || 0
      );

      return {
        id: teacher.id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        profilePicture: teacher.profilePicture,
        subjects: profile?.subjects || [],
        experience: profile?.experience || 0,
        bio: profile?.bio || '',
        hourlyRate: profile?.hourlyRate?.toString() || null,
        qualifications: profile?.qualifications || [],
        isTopRated,
        rating: profile?.rating?.toString() || '0',
        reviewCount: profile?.reviewCount || 0,
        responseTime: profile?.responseTime || 'N/A',
        availability: profile?.availability || 'Contact for availability',
        languages: profile?.languages || [],
        lessonsCompleted: profile?.lessonsCompleted || 0,
        activeStudents: profile?.activeStudents || 0,
        teachingStyle: profile?.teachingStyle || '',
        specialties: profile?.specialties || [],
        headline: profile?.headline || '',
      };
    });

    return NextResponse.json({
      success: true,
      teachers: formattedTeachers,
      count: formattedTeachers.length,
    });
  } catch (error) {
    console.error('Error fetching featured teachers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch teachers',
        teachers: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
