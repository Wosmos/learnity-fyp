/**
 * ReviewsList Component
 * Display list of course reviews with ratings, student info, and dates
 * 
 * Requirements covered:
 * - 8.4: Show all reviews on course detail page with student name and date
 */

"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/courses/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string | null;
  };
  isVerified?: boolean;
}

export interface ReviewsListProps {
  reviews: Review[];
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * ReviewsList - Display list of reviews with student info and ratings
 */
export function ReviewsList({
  reviews,
  showLoadMore = false,
  onLoadMore,
  isLoading = false,
  emptyMessage = "No reviews yet. Be the first to review!",
  className,
}: ReviewsListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  if (reviews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const hasLongComment = review.comment && review.comment.length > 200;
          const displayComment = hasLongComment && !isExpanded && review.comment
            ? `${review.comment.substring(0, 200)}...`
            : review.comment;

          return (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage
                      src={review.student.profilePicture || undefined}
                      alt={`${review.student.firstName} ${review.student.lastName}`}
                    />
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(review.student.firstName, review.student.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {review.student.firstName} {review.student.lastName}
                          </h4>
                          {review.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex-shrink-0">
                        <StarRating
                          value={review.rating}
                          size="sm"
                          readonly
                          showValue
                        />
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div className="mt-3">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {displayComment}
                        </p>
                        {hasLongComment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(review.id)}
                            className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp className="h-4 w-4 ml-1" />
                              </>
                            ) : (
                              <>
                                Read more <ChevronDown className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Updated indicator */}
                    {review.updatedAt && review.updatedAt !== review.createdAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        (Edited {formatDate(review.updatedAt)})
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
      {showLoadMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * ReviewsListSkeleton - Loading skeleton for reviews list
 */
export function ReviewsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ReviewsList;
