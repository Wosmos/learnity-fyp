import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/config/database';

function calculateIsTopRated(
  rating: number,
  reviewCount: number,
  lessonsCompleted: number,
  experience: number
): boolean {
  return (
    rating >= 4.8 &&
    reviewCount >= 80 &&
    lessonsCompleted >= 400 &&
    experience >= 5
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const subjectsParam = searchParams.get('subjects');

  if (!subjectsParam) {
    return NextResponse.json({
      success: true,
      teachers: [],
    });
  }

  const subjects = subjectsParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  try {
    // Find teachers who teach similar subjects (excluding current teacher)
    const teachers = await prisma.user.findMany({
      where: {
        id: { not: id },
        role: 'TEACHER',
        isActive: true,
        teacherProfile: {
          applicationStatus: 'APPROVED',
          subjects: {
            hasSome: subjects, // PostgreSQL array overlap operator
          },
        },
      },
      include: {
        teacherProfile: true,
      },
      take: 12, // Limit to 12 similar teachers
    });

    // Calculate similarity score and sort by relevance
    const teachersWithScore = teachers
      .map(teacher => {
        if (!teacher.teacherProfile) return null;

        const profile = teacher.teacherProfile;
        const teacherSubjects = profile.subjects || [];

        // Calculate similarity score based on subject overlap
        const commonSubjects = subjects.filter(subject =>
          teacherSubjects.some(
            ts =>
              ts.toLowerCase().includes(subject.toLowerCase()) ||
              subject.toLowerCase().includes(ts.toLowerCase())
          )
        );

        const similarityScore =
          commonSubjects.length /
          Math.max(subjects.length, teacherSubjects.length);
        const rating = parseFloat(profile.rating?.toString() || '0');

        // Boost score for highly rated teachers
        const finalScore = similarityScore + (rating / 5) * 0.2;

        return {
          teacher,
          score: finalScore,
          commonSubjects: commonSubjects.length,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        // Sort by similarity score first, then by rating
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        const ratingA = parseFloat(
          a.teacher.teacherProfile!.rating?.toString() || '0'
        );
        const ratingB = parseFloat(
          b.teacher.teacherProfile!.rating?.toString() || '0'
        );
        return ratingB - ratingA;
      });

    const formattedTeachers = teachersWithScore.map(({ teacher }) => {
      const profile = teacher.teacherProfile!;
      const rating = parseFloat(profile.rating?.toString() || '0');
      const isTopRated = calculateIsTopRated(
        rating,
        profile.reviewCount,
        profile.lessonsCompleted,
        profile.experience
      );

      return {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        profilePicture: teacher.profilePicture || profile.profilePicture,
        teacherProfile: {
          subjects: profile.subjects,
          experience: profile.experience,
          bio: profile.bio,
          hourlyRate: profile.hourlyRate?.toString(),
          rating: profile.rating?.toString(),
          reviewCount: profile.reviewCount,
          responseTime: profile.responseTime,
          city: profile.city,
          country: profile.country,
          isTopRated,
          lessonsCompleted: profile.lessonsCompleted,
          activeStudents: profile.activeStudents,
          headline: profile.headline,
        },
      };
    });

    return NextResponse.json({
      success: true,
      teachers: formattedTeachers,
    });
  } catch (error) {
    console.error('Error fetching similar teachers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch similar teachers' },
      { status: 500 }
    );
  }
}
