/**
 * Teacher Filters Component
 * Filter teachers by subject, price, rating
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TeacherFiltersProps {
  subjects: string[];
  selectedSubject: string | null;
  onSubjectChange: (subject: string | null) => void;
  priceRange: string | null;
  onPriceChange: (range: string | null) => void;
  minRating: number | null;
  onRatingChange: (rating: number | null) => void;
}

const PRICE_RANGES = [
  { label: 'Under $50', value: '0-50' },
  { label: '$50-$65', value: '50-65' },
  { label: '$65-$75', value: '65-75' },
  { label: 'Above $75', value: '75-999' },
];

const RATINGS = [4.5, 4.7, 4.8, 4.9];

export function TeacherFilters({
  subjects,
  selectedSubject,
  onSubjectChange,
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
}: TeacherFiltersProps) {
  const hasFilters = selectedSubject || priceRange || minRating;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSubjectChange(null);
              onPriceChange(null);
              onRatingChange(null);
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Subject Filter */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Subject</div>
          <div className="flex flex-wrap gap-2">
            {subjects.slice(0, 8).map((subject) => (
              <Badge
                key={subject}
                variant={selectedSubject === subject ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => onSubjectChange(selectedSubject === subject ? null : subject)}
              >
                {subject}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Price Range</div>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range) => (
              <Badge
                key={range.value}
                variant={priceRange === range.value ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => onPriceChange(priceRange === range.value ? null : range.value)}
              >
                {range.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</div>
          <div className="flex flex-wrap gap-2">
            {RATINGS.map((rating) => (
              <Badge
                key={rating}
                variant={minRating === rating ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => onRatingChange(minRating === rating ? null : rating)}
              >
                {rating}+ ⭐
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
