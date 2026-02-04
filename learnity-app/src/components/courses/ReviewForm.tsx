/**
 * ReviewForm Component
 * Form for submitting course reviews with star rating and optional comment
 *
 * Requirements covered:
 * - 8.1: Review eligibility (50% progress required)
 * - 8.2: Rating 1-5 with optional comment (10-500 chars)
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StarRating } from '@/components/courses/StarRating';
import { useToast } from '@/hooks/use-toast';

export interface ReviewFormProps {
  courseId: string;
  courseName: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * ReviewForm - Form component for creating/editing course reviews
 * Validates rating (1-5) and optional comment (10-500 chars)
 */
export function ReviewForm({
  courseId,
  courseName,
  existingReview,
  onSuccess,
  onCancel,
  className,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;
  const commentLength = comment.trim().length;
  const isCommentValid =
    commentLength === 0 || (commentLength >= 10 && commentLength <= 500);
  const isFormValid = rating > 0 && isCommentValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate rating
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    // Validate comment if provided
    const trimmedComment = comment.trim();
    if (trimmedComment.length > 0 && trimmedComment.length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    if (trimmedComment.length > 500) {
      setError('Comment must be less than 500 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update existing review
        const response = await fetch(`/api/reviews/${existingReview.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            comment: trimmedComment || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update review');
        }

        toast({
          title: 'Review Updated',
          description: 'Your review has been updated successfully.',
        });
      } else {
        // Create new review
        const response = await fetch(`/api/courses/${courseId}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            comment: trimmedComment || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit review');
        }

        toast({
          title: 'Review Submitted',
          description: 'Thank you for your feedback!',
        });
      }

      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </CardTitle>
        <CardDescription>
          Share your experience with {courseName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Rating Input */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Your Rating <span className='text-destructive'>*</span>
            </label>
            <div className='flex items-center gap-4'>
              <StarRating
                value={rating}
                onChange={setRating}
                size='lg'
                showValue
                allowHalf={false}
                allowClear
              />
              {rating > 0 && (
                <span className='text-sm text-muted-foreground'>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div className='space-y-2'>
            <label htmlFor='comment' className='text-sm font-medium'>
              Your Review (Optional)
            </label>
            <Textarea
              id='comment'
              placeholder='Share your thoughts about this course... (minimum 10 characters if provided)'
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={5}
              maxLength={500}
              className='resize-none'
            />
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>
                {commentLength > 0 && commentLength < 10 && (
                  <span className='text-destructive'>
                    Minimum 10 characters required
                  </span>
                )}
                {commentLength >= 10 && commentLength <= 500 && (
                  <span className='text-green-600'>
                    <CheckCircle2 className='h-3 w-3 inline mr-1' />
                    Valid comment length
                  </span>
                )}
              </span>
              <span className={commentLength > 500 ? 'text-destructive' : ''}>
                {commentLength} / 500
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className='flex items-center gap-3'>
            <Button
              type='submit'
              disabled={!isFormValid || isSubmitting}
              className='flex-1'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>{isEditing ? 'Update Review' : 'Submit Review'}</>
              )}
            </Button>
            {onCancel && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ReviewForm;
