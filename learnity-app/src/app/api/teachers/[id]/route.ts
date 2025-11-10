/**
 * Individual Teacher API
 * Returns complete teacher profile with testimonials
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/config/database';

// Helper to calculate if teacher is top rated
function calculateIsTopRated(rating: number, reviewCount: number, lessonsCompleted: number, experience: number): boolean {
  return rating >= 4.8 && reviewCount >= 80 && lessonsCompleted >= 400 && experience >= 5;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'TEACHER',
        isActive: true,
      },
      include: {
        teacherProfile: true,
      },
    });

    if (!teacher || !teacher.teacherProfile || teacher.teacherProfile.applicationStatus !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Fetch testimonials
    const testimonials = await prisma.testimonial.findMany({
      where: {
        teacherId: teacher.id,
      },
      orderBy: {
        date: 'desc',
      },
      take: 20,
    });

    const profile = teacher.teacherProfile;
    const rating = parseFloat(profile.rating?.toString() || '0');
    const isTopRated = calculateIsTopRated(
      rating,
      profile.reviewCount,
      profile.lessonsCompleted,
      profile.experience
    );

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        profilePicture: teacher.profilePicture,
        subjects: profile.subjects,
        experience: profile.experience,
        bio: profile.bio,
        hourlyRate: profile.hourlyRate?.toString(),
        qualifications: profile.qualifications,
        isTopRated,
        rating: profile.rating?.toString(),
        reviewCount: profile.reviewCount,
        responseTime: profile.responseTime,
        availability: profile.availability,
        languages: profile.languages,
        lessonsCompleted: profile.lessonsCompleted,
        activeStudents: profile.activeStudents,
        teachingStyle: profile.teachingStyle,
        specialties: profile.specialties,
        certifications: profile.certifications,
        education: profile.education,
        availableDays: profile.availableDays,
        preferredTimes: profile.preferredTimes,
        headline: profile.headline,
        achievements: profile.achievements,
        teachingApproach: profile.teachingApproach,
        videoIntroUrl: profile.videoIntroUrl,
        testimonials: testimonials.map(t => ({
          id: t.id,
          studentName: t.studentName,
          rating: t.rating,
          comment: t.comment,
          subject: t.subject,
          date: t.date.toISOString(),
          isVerified: t.isVerified,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teacher' },
      { status: 500 }
    );
  }
}
