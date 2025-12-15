'use client';

/**
 * Course Catalog Page
 * Public page for browsing and searching courses
 * Requirements: 3.1, 3.2, 3.3, 3.4 - Course discovery and browsing
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CourseCard,
  CourseCardSkeleton,
  CourseFilters,
  CourseFiltersCompact,
  SearchInput,
  type CourseFiltersState,
  type Category,
} from '@/components/courses';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isFree: boolean;
  price?: number | null;
  totalDuration: number;
  lessonCount: number;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  teacher: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface PaginatedResponse {
  courses: CourseData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ViewMode = 'grid' | 'list';

interface CourseCatalogPageProps {
  basePath?: string;
  skipUrlUpdate?: boolean;
}

export default function CourseCatalogPage({ 
  basePath = '/courses',
  skipUrlUpdate = false 
}: CourseCatalogPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse filters from URL
  const [filters, setFilters] = useState<CourseFiltersState>(() => ({
    categoryId: searchParams.get('categoryId') || undefined,
    difficulty: (searchParams.get('difficulty') as CourseFiltersState['difficulty']) || undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    sortBy: (searchParams.get('sortBy') as CourseFiltersState['sortBy']) || 'popular',
  }));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(
    searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
  );
  const limit = 12;

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (filters.minRating) params.set('minRating', filters.minRating.toString());
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/courses?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch courses');
      }

      const responseData = await response.json();
      const data: PaginatedResponse = responseData.data || responseData;
      
      setCourses(data.courses || []);
      setTotalCourses(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, currentPage, limit]);

  // Update URL with current filters
  const updateURL = useCallback(() => {
    if (skipUrlUpdate) return; // Skip URL updates when embedded
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.sortBy && filters.sortBy !== 'popular') params.set('sortBy', filters.sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath, { scroll: false });
  }, [searchQuery, filters, currentPage, router, basePath, skipUrlUpdate]);

  // Effects
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCourses();
    updateURL();
  }, [fetchCourses, updateURL]);

  // Handlers
  const handleFiltersChange = (newFilters: CourseFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) => (
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-muted-foreground">
                {page}
              </span>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
   
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-primary" />
                    Course Catalog
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Discover {totalCourses > 0 ? `${totalCourses} courses` : 'courses'} to enhance your skills
                  </p>
                </div>

                {/* View Mode Toggle (Desktop) */}
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-3">
                <SearchInput
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search courses by title, description, or tags..."
                  isLoading={isLoading}
                  className="flex-1 max-w-2xl"
                />

                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  
                  onClick={() => setShowMobileFilters(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Desktop Filters Bar */}
              <div className="hidden md:block lg:hidden mb-6">
                {!isLoadingCategories && (
                  <CourseFilters
                    categories={categories}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                  />
                )}
              </div>

              {/* Results Info */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-4 w-32 inline-block" />
                  ) : (
                    <>
                      Showing {courses.length} of {totalCourses} courses
                      {searchQuery && ` for "${searchQuery}"`}
                    </>
                  )}
                </p>
              </div>

              {/* Error State */}
              {error && (
                <Card className="mb-6 border-destructive">
                  <CardContent className="py-4">
                    <p className="text-destructive">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchCourses}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Course Grid/List */}
              {isLoading ? (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'flex flex-col gap-4'
                  )}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CourseCardSkeleton key={i} size={viewMode} />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? `No courses match "${searchQuery}". Try adjusting your search or filters.`
                        : 'No courses match your current filters. Try adjusting them.'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({ sortBy: 'popular' });
                        setCurrentPage(1);
                      }}
                    >
                      Clear all filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'flex flex-col gap-4'
                  )}
                >
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      description={course.description}
                      thumbnailUrl={course.thumbnailUrl}
                      teacherName={course.teacher?.name || 'Unknown Teacher'}
                      teacherAvatarUrl={course.teacher?.avatarUrl}
                      rating={Number(course.averageRating) || 0}
                      reviewCount={course.reviewCount || 0}
                      enrollmentCount={course.enrollmentCount || 0}
                      difficulty={course.difficulty}
                      totalDuration={course.totalDuration}
                      lessonCount={course.lessonCount}
                      isFree={course.isFree}
                      price={course.price ? Number(course.price) : null}
                      size={viewMode}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && courses.length > 0 && <Pagination />}
            </div>
          </div>
        </main>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 ">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                {!isLoadingCategories && (
                  <CourseFiltersCompact
                    categories={categories}
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                      handleFiltersChange(newFilters);
                      setShowMobileFilters(false);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
   
  );
}
