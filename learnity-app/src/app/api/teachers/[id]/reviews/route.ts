import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/config/database";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Get all reviews for courses taught by this teacher
    const reviews = await prisma.review.findMany({
      where: {
        course: {
          teacherId: id,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Calculate rating distribution
    const ratingDistribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    const formattedReviews = reviews.map((review) => ({
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
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}