'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Grid3X3, LayoutGrid, List, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CourseCard,
  CourseFilters,
  SearchInput,
  type CourseFiltersState,
  type Category,
} from '@/components/courses';
import { CompactPagination } from '@/components/shared/CompactPagination';
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

interface CourseCatalogClientProps {
  initialCourses: CourseData[];
  initialCategories: Category[];
  initialTotal: number;
  initialTotalPages: number;
  basePath?: string;
}

export default function CourseCatalogClient({
  initialCourses,
  initialCategories,
  initialTotal,
  initialTotalPages,
  basePath = '/courses',
}: CourseCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const filters = useMemo(
    (): CourseFiltersState => ({
      categoryId: searchParams.get('categoryId') || undefined,
      difficulty: (searchParams.get('difficulty') as any) || undefined,
      minRating: searchParams.get('minRating')
        ? parseFloat(searchParams.get('minRating')!)
        : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'popular',
    }),
    [searchParams]
  );

  const currentPage = useMemo(
    () =>
      searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
    [searchParams]
  );

  const performNavigation = useCallback(
    (params: URLSearchParams) => {
      const currentString = searchParams.toString();
      const newString = params.toString();

      if (currentString !== newString) {
        router.push(newString ? `${basePath}?${newString}` : basePath, {
          scroll: false,
        });
      }
    },
    [searchParams, router, basePath]
  );

  const handleSearchUpdate = useCallback(
    (newSearch: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSearch) params.set('search', newSearch);
      else params.delete('search');
      params.delete('page'); // Reset page on search
      performNavigation(params);
    },
    [searchParams, performNavigation]
  );

  const handleFiltersChange = useCallback(
    (newFilters: CourseFiltersState) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newFilters.categoryId)
        params.set('categoryId', newFilters.categoryId);
      else params.delete('categoryId');
      if (newFilters.difficulty)
        params.set('difficulty', newFilters.difficulty);
      else params.delete('difficulty');
      if (newFilters.minRating)
        params.set('minRating', newFilters.minRating.toString());
      else params.delete('minRating');
      if (newFilters.sortBy && newFilters.sortBy !== 'popular')
        params.set('sortBy', newFilters.sortBy);
      else params.delete('sortBy');

      params.delete('page'); // Reset page on filter change
      performNavigation(params);
    },
    [searchParams, performNavigation]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) params.set('page', page.toString());
      else params.delete('page');
      performNavigation(params);
      if (typeof window !== 'undefined')
        window.scrollTo({ top: 400, behavior: 'smooth' });
    },
    [searchParams, performNavigation]
  );

  // Handle Search Input Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearchInUrl = searchParams.get('search') || '';
      if (searchQuery !== currentSearchInUrl) {
        handleSearchUpdate(searchQuery);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearchUpdate, searchParams]);

  return (
    <main className='max-w-[1600px] mx-auto px-6 lg:px-10 py-10'>
      {/* Control Bar */}
      <div className='bg-white rounded-3xl p-4 shadow-xl  border border-slate-100 mb-10 sticky top-[72px] z-40 backdrop-blur-md bg-white/90'>
        <div className='flex flex-col md:flex-row items-center gap-4'>
          <div className='relative flex-1 w-full group'>
            <Search className='absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300' />
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder='Search courses...'
              className='w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-xl text-sm'
              debounceMs={0} // We handle debounce locally for URL stability
            />
          </div>

          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'h-14 px-8 rounded-2xl border-slate-100 font-black text-xs uppercase tracking-widest transition-all',
                showFilters && 'bg-slate-900 text-white border-slate-900'
              )}
            >
              <Filter className='h-4 w-4 mr-3' />
              {showFilters ? 'Hide' : 'Filter'}
            </Button>

            <div className='hidden sm:flex items-center p-1 bg-slate-50 rounded-2xl border border-slate-100 h-14'>
              {[
                { id: 'grid', icon: Grid3X3 },
                { id: 'list', icon: List },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setViewMode(option.id as 'grid' | 'list')}
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl transition-all',
                    viewMode === option.id
                      ? 'bg-white shadow-sm text-indigo-600 border border-slate-100'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <option.icon className='h-5 w-5' />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inline Filters */}
        {showFilters && (
          <div className='mt-4 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300'>
            <CourseFilters
              categories={initialCategories}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}
      </div>

      <div className='flex flex-col gap-10 min-h-[600px]'>
        <div className='flex items-end justify-between px-2'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <div className='h-1 w-8 bg-indigo-600 rounded-full' />
              <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]'>
                Course Catalog
              </h3>
            </div>
            <h2 className='text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none'>
              {searchQuery ? (
                <>
                  Searching for{' '}
                  <span className='text-indigo-600'>"{searchQuery}"</span>
                </>
              ) : (
                <>
                  Available <span className='text-indigo-600'>Programs</span>
                </>
              )}
            </h2>
            <p className='text-xs font-bold text-slate-400'>
              Discover <span className='text-slate-900'>{initialTotal}</span>{' '}
              curated courses professionaly designed for your success.
            </p>
          </div>

          {initialTotalPages > 1 && (
            <CompactPagination
              currentPage={currentPage}
              totalPages={initialTotalPages}
              onPageChange={handlePageChange}
              className='hidden md:flex'
            />
          )}
        </div>

        {initialCourses.length === 0 ? (
          <div className='bg-slate-50 rounded-[1.3rem] py-32 text-center border-2 border-dashed border-slate-200/50 opacity-60'>
            <div className='mb-6 opacity-20'>
              <Search className='h-12 w-12 mx-auto text-slate-400' />
            </div>
            <h3 className='text-xl font-black text-slate-900 uppercase italic'>
              No courses found
            </h3>
            <p className='text-slate-400 text-sm mt-2 font-medium'>
              We couldn't find any courses matching your specific criteria.
            </p>
            <Button
              variant='outline'
              className='mt-8 rounded-xl font-black text-xs uppercase'
              onClick={() => {
                setSearchQuery('');
                handleFiltersChange({
                  sortBy: 'popular',
                });
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'relative rounded-[3rem] transition-all duration-500',
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-8'
                : 'flex flex-col gap-4 max-w-7xl mx-auto w-full'
            )}
          >
            {initialCourses.map((course, idx) => (
              <div
                key={course.id}
                className='transition-all duration-500 hover:translate-y-[-4px]'
              >
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnailUrl={course.thumbnailUrl}
                  teacherName={course.teacher.name}
                  teacherAvatarUrl={course.teacher.avatarUrl}
                  rating={course.averageRating}
                  reviewCount={course.reviewCount}
                  enrollmentCount={course.enrollmentCount}
                  difficulty={course.difficulty as any}
                  totalDuration={course.totalDuration}
                  lessonCount={course.lessonCount}
                  isFree={course.isFree}
                  price={course.price ? Number(course.price) : null}
                  size={viewMode}
                  category={course.category as any}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom Pagination for Mobile & Desktop Backup */}
        {initialTotalPages > 1 && (
          <div className='flex justify-center mt-10 border-t border-slate-50 pt-10'>
            <CompactPagination
              currentPage={currentPage}
              totalPages={initialTotalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </main>
  );
}
