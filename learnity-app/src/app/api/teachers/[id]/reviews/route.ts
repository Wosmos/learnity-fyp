import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  try {
    const where = { course: { teacherId: id } } as const;

    // Fetch paginated reviews and stats in parallel
    const [reviews, totalReviews, ratingAgg] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, profilePicture: true },
          },
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: true,
      }),
    ]);

    const averageRating =
      totalReviews > 0
        ? ratingAgg.reduce((sum, r) => sum + r.rating * r._count, 0) / totalReviews
        : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingAgg.forEach(r => { ratingDistribution[r.rating] = r._count; });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      student: {
        id: review.student.id,
        firstName: review.student.firstName,
        lastName: review.student.lastName,
        profilePicture: review.student.profilePicture,
      },
      course: {
        id: review.course.id,
        title: review.course.title,
        slug: review.course.slug,
      },
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
        hasMore: page * limit < totalReviews,
      },
    });
  } catch (error) {
    console.error('Error fetching teacher reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
