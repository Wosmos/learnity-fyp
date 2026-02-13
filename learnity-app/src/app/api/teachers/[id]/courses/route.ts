import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/config/database';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const courses = await prisma.course.findMany({
      where: {
        teacherId: id,
        status: 'PUBLISHED',
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { enrollmentCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      difficulty: course.difficulty,
      tags: course.tags,
      status: course.status,
      isFree: course.isFree,
      price: course.price ? parseFloat(course.price.toString()) : null,
      totalDuration: course.totalDuration,
      lessonCount: course.lessonCount,
      enrollmentCount: course.enrollmentCount,
      averageRating: parseFloat(course.averageRating.toString()),
      reviewCount: course.reviewCount,
      category: course.category,
    }));

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
