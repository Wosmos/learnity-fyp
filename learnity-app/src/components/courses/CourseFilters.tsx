'use client';

import * as React from 'react';
import {
  Filter,
  SortAsc,
  X,
  Check,
  Star,
  Signal,
  BarChart3,
  SortDesc,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Types for filter options
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SortOption = 'popular' | 'rating' | 'newest';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CourseFiltersState {
  categoryId?: string;
  difficulty?: DifficultyLevel;
  minRating?: number;
  sortBy?: SortOption;
}

export interface CourseFiltersProps {
  categories: Category[];
  filters: CourseFiltersState;
  onFiltersChange: (filters: CourseFiltersState) => void;
  className?: string;
  showClearButton?: boolean;
}

const difficultyOptions: { value: DifficultyLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const ratingOptions: { value: number; label: string }[] = [
  { value: 4.5, label: '4.5+ Stars' },
  { value: 4.0, label: '4.0+ Stars' },
  { value: 3.5, label: '3.5+ Stars' },
  { value: 3.0, label: '3.0+ Stars' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
];

/**
 * CourseFilters Component
 * Provides filtering and sorting options for course catalog
 * Requirements: 3.2, 3.4 - Category dropdown, difficulty selector, rating filter, sort options
 */
export function CourseFilters({
  categories,
  filters,
  onFiltersChange,
  className,
  showClearButton = true,
}: CourseFiltersProps) {
  const hasActiveFilters =
    filters.categoryId || filters.difficulty || filters.minRating;

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categoryId: value === 'all' ? undefined : value,
    });
  };

  const handleDifficultyChange = (value: string) => {
    onFiltersChange({
      ...filters,
      difficulty: value === 'all' ? undefined : (value as DifficultyLevel),
    });
  };

  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minRating: value === 'all' ? undefined : parseFloat(value),
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as SortOption,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      sortBy: filters.sortBy, // Keep sort option
    });
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Filter Controls */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Filter className='h-4 w-4' />
          <span className='font-medium'>Filters:</span>
        </div>

        {/* Category Filter */}
        <Select
          value={filters.categoryId ?? 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty Filter */}
        <Select
          value={filters.difficulty ?? 'all'}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Difficulty' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Levels</SelectItem>
            {difficultyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select
          value={filters.minRating?.toString() ?? 'all'}
          onValueChange={handleRatingChange}
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Rating' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Any Rating</SelectItem>
            {ratingOptions.map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <div className='flex items-center gap-2 ml-auto'>
          <SortAsc className='h-4 w-4 text-muted-foreground' />
          <Select
            value={filters.sortBy ?? 'popular'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && showClearButton && (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Active filters:</span>

          {filters.categoryId && (
            <Badge variant='secondary' className='gap-1'>
              {categories.find(c => c.id === filters.categoryId)?.name}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, categoryId: undefined })
                }
                className='ml-1 hover:text-destructive'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          {filters.difficulty && (
            <Badge variant='secondary' className='gap-1'>
              {
                difficultyOptions.find(d => d.value === filters.difficulty)
                  ?.label
              }
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, difficulty: undefined })
                }
                className='ml-1 hover:text-destructive'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          {filters.minRating && (
            <Badge variant='secondary' className='gap-1'>
              {filters.minRating}+ Stars
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, minRating: undefined })
                }
                className='ml-1 hover:text-destructive'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          <Button
            variant='ghost'
            size='sm'
            onClick={handleClearFilters}
            className='text-muted-foreground hover:text-foreground'
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of CourseFilters for mobile or sidebar use
 */
export function CourseFiltersCompact({
  categories,
  filters,
  onFiltersChange,
  className,
}: Omit<CourseFiltersProps, 'showClearButton'>) {
  const updateFilter = (key: keyof typeof filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className={cn('flex flex-col gap-6 py-2', className)}>
      {/* 1. DOMAINS - Dense Grid */}
      <FilterGroup label='Domain' icon={BarChart3}>
        <div className='grid grid-cols-2 gap-2'>
          <CompactChoice
            label='All'
            isActive={!filters.categoryId}
            onClick={() => updateFilter('categoryId', undefined)}
          />
          {categories.map(cat => (
            <CompactChoice
              key={cat.id}
              label={cat.name}
              isActive={filters.categoryId === cat.id}
              onClick={() => updateFilter('categoryId', cat.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <Separator className='opacity-50' />

      {/* 2. DIFFICULTY - Inline Row */}
      <FilterGroup label='Experience' icon={Signal}>
        <div className='flex flex-wrap gap-1.5'>
          {['all', ...difficultyOptions.map(o => o.value)].map(opt => {
            const label =
              opt === 'all'
                ? 'All'
                : difficultyOptions.find(d => d.value === opt)?.label;
            const isActive =
              (opt === 'all' && !filters.difficulty) ||
              filters.difficulty === opt;

            return (
              <button
                key={opt}
                onClick={() =>
                  updateFilter('difficulty', opt === 'all' ? undefined : opt)
                }
                className={cn(
                  'flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all',
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* 3. RATING - Compact Star Row */}
      <FilterGroup label='Min Rating' icon={Star}>
        <div className='grid grid-cols-4 gap-1.5'>
          {[undefined, 4.5, 4.0, 3.5].map(val => (
            <button
              key={val ?? 'any'}
              onClick={() => updateFilter('minRating', val)}
              className={cn(
                'flex flex-col items-center justify-center py-2 rounded-lg border transition-all',
                filters.minRating === val
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-100 bg-white text-slate-400'
              )}
            >
              <Star
                className={cn(
                  'h-3 w-3 mb-0.5',
                  filters.minRating === val
                    ? 'fill-indigo-600'
                    : 'fill-transparent'
                )}
              />
              <span className='text-[10px] font-bold'>
                {val ? `${val}` : 'Any'}
              </span>
            </button>
          ))}
        </div>
      </FilterGroup>

      <Separator className='opacity-50' />

      {/* 4. SORTING - Minimal Selection */}
      <FilterGroup label='Order By' icon={SortDesc}>
        <div className='flex flex-col gap-1'>
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => updateFilter('sortBy', option.value)}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl transition-all',
                filters.sortBy === option.value
                  ? 'bg-indigo-50/50'
                  : 'hover:bg-slate-50'
              )}
            >
              <span
                className={cn(
                  'text-xs font-semibold',
                  filters.sortBy === option.value
                    ? 'text-indigo-700'
                    : 'text-slate-600'
                )}
              >
                {option.label}
              </span>
              {filters.sortBy === option.value && (
                <Check className='h-3.5 w-3.5 text-indigo-600' />
              )}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

// --- Sleek Layout Helpers ---

function FilterGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 px-1'>
        <Icon className='h-3.5 w-3.5 text-slate-400' />
        <h3 className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}

function CompactChoice({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all',
        isActive
          ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
          : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
      )}
    >
      <span
        className={cn(
          'text-[11px] font-bold truncate leading-tight',
          isActive ? 'text-indigo-700' : 'text-slate-600'
        )}
      >
        {label}
      </span>
      {isActive && (
        <div className='h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0 ml-2' />
      )}
    </button>
  );
}

export default CourseFilters;
