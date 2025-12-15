"use client";

import * as React from "react";
import { Filter, SortAsc, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types for filter options
export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type SortOption = "popular" | "rating" | "newest";

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
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const ratingOptions: { value: number; label: string }[] = [
  { value: 4.5, label: "4.5+ Stars" },
  { value: 4.0, label: "4.0+ Stars" },
  { value: 3.5, label: "3.5+ Stars" },
  { value: 3.0, label: "3.0+ Stars" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
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
      categoryId: value === "all" ? undefined : value,
    });
  };

  const handleDifficultyChange = (value: string) => {
    onFiltersChange({
      ...filters,
      difficulty: value === "all" ? undefined : (value as DifficultyLevel),
    });
  };

  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minRating: value === "all" ? undefined : parseFloat(value),
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
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters:</span>
        </div>

        {/* Category Filter */}
        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty Filter */}
        <Select
          value={filters.difficulty ?? "all"}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {difficultyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select
          value={filters.minRating?.toString() ?? "all"}
          onValueChange={handleRatingChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            {ratingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <div className="flex items-center gap-2 ml-auto">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.sortBy ?? "popular"}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.id === filters.categoryId)?.name}
              <button
                onClick={() => onFiltersChange({ ...filters, categoryId: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.difficulty && (
            <Badge variant="secondary" className="gap-1">
              {difficultyOptions.find((d) => d.value === filters.difficulty)?.label}
              <button
                onClick={() => onFiltersChange({ ...filters, difficulty: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.minRating && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+ Stars
              <button
                onClick={() => onFiltersChange({ ...filters, minRating: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
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
}: Omit<CourseFiltersProps, "showClearButton">) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Category Filter */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              categoryId: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Difficulty</label>
        <Select
          value={filters.difficulty ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              difficulty: value === "all" ? undefined : (value as DifficultyLevel),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {difficultyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Minimum Rating</label>
        <Select
          value={filters.minRating?.toString() ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              minRating: value === "all" ? undefined : parseFloat(value),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            {ratingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Options */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Sort By</label>
        <Select
          value={filters.sortBy ?? "popular"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              sortBy: value as SortOption,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Most Popular" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default CourseFilters;
