/**
 * Teacher Actual Reviews - Shows real reviews from students who took courses
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Calendar,
  BookOpen,
  Verified,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface TeacherActualReviewsProps {
  teacherId: string;
  teacherName: string;
}

function StarRating({
  rating,
  size = 'sm',
}: {
  rating: number;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };

  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function RatingDistribution({ stats }: { stats: ReviewStats }) {
  return (
    <div className='space-y-2'>
      {[5, 4, 3, 2, 1].map(rating => {
        const count = stats.ratingDistribution[rating] || 0;
        const percentage =
          stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

        return (
          <div key={rating} className='flex items-center gap-2 text-sm'>
            <span className='w-3 text-gray-600'>{rating}</span>
            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
            <div className='flex-1 bg-gray-200 rounded-full h-2'>
              <div
                className='bg-yellow-400 h-2 rounded-full transition-all duration-300'
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className='w-8 text-xs text-gray-500'>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TeacherActualReviews({
  teacherId,
  teacherName,
}: TeacherActualReviewsProps) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/teachers/${teacherId}/reviews`);
        const data = await response.json();

        if (data.success) {
          setReviews(data.reviews);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching teacher reviews:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [teacherId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5 text-indigo-600' />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <div key={i} className='animate-pulse'>
                <div className='flex gap-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                    <div className='h-3 bg-gray-200 rounded w-full'></div>
                    <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5 text-indigo-600' />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>No reviews yet</p>
            <p className='text-sm text-gray-500 mt-1'>
              Be the first to leave a review for {teacherName}!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);
  const hasMore = reviews.length > 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5 text-indigo-600' />
          Student Reviews
          <Badge variant='secondary' className='ml-auto'>
            {stats.totalReviews}{' '}
            {stats.totalReviews === 1 ? 'Review' : 'Reviews'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Rating Summary */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-lg'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-gray-900 mb-1'>
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(stats.averageRating)} size='md' />
            <p className='text-sm text-gray-600 mt-1'>
              Based on {stats.totalReviews} reviews
            </p>
          </div>
          <div>
            <RatingDistribution stats={stats} />
          </div>
        </div>

        {/* Individual Reviews */}
        <div className='space-y-6'>
          {displayedReviews.map(review => (
            <div
              key={review.id}
              className='border-b border-gray-100 pb-6 last:border-b-0'
            >
              <div className='flex gap-4'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={review.student.profilePicture || undefined}
                    alt={`${review.student.firstName} ${review.student.lastName}`}
                  />
                  <AvatarFallback className='bg-indigo-100 text-indigo-600'>
                    {review.student.firstName[0]}
                    {review.student.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-medium text-gray-900'>
                      {review.student.firstName} {review.student.lastName[0]}.
                    </h4>
                    <Verified className='h-4 w-4 text-blue-500' />
                    <StarRating rating={review.rating} />
                    <span className='text-sm text-gray-500'>
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 mb-3'>
                    <BookOpen className='h-3 w-3 text-gray-400' />
                    <span className='text-sm text-gray-600'>
                      Course: {review.course.title}
                    </span>
                  </div>

                  {review.comment && (
                    <p className='text-gray-700 leading-relaxed'>
                      {review.comment}
                    </p>
                  )}

                  <div className='flex items-center gap-4 mt-3'>
                    <button className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors'>
                      <ThumbsUp className='h-3 w-3' />
                      Helpful
                    </button>
                    <span className='text-sm text-gray-400'>
                      <Calendar className='h-3 w-3 inline mr-1' />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className='mt-6 text-center'>
            <Button
              variant='outline'
              onClick={() => setShowAll(!showAll)}
              className='w-full'
            >
              {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
