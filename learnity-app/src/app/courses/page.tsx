'use client';

/**
 * Course Catalog Page
 * Public page for browsing and searching courses
 * Requirements: 3.1, 3.2, 3.3, 3.4 - Course discovery and browsing
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

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
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    createdAt: string;

  };
  createdAt: string;
  updatedAt: string;
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

function CourseCatalogContent({
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
  const [tempFilters, setTempFilters] = useState<CourseFiltersState>({});

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
      console.log(response, 'this is response')
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
      console.log(response, 'response')
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

  const openMobileFilters = () => {
    setTempFilters(filters);
    setShowMobileFilters(true);
  };

  const applyMobileFilters = () => {
    handleFiltersChange(tempFilters);
    setShowMobileFilters(false);
  };

  const resetMobileFilters = () => {
    setTempFilters({
      categoryId: undefined,
      difficulty: undefined,
      minRating: undefined,
      sortBy: 'popular',
    });
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
      <div className="min-h-screen bg-[#F8FAFC]">

        {/* ELITE HERO HEADER */}
        <div className="relative bg-[#020617] pt-16 pb-24 overflow-hidden">
          {/* Subtle SVG Grid Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
          </div>

          <div className="max-w-[1600px] mx-auto px-6 lg:px-10 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Knowledge Base v2.0</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none italic uppercase">
                  Course <span className="text-indigo-500">Terminal</span>
                </h1>
                <p className="text-slate-400 font-medium max-w-xl text-lg">
                  Access high-performance learning modules. {totalCourses} nodes available for deployment.
                </p>
              </div>

              {/* Glassmorphic Global Search */}
              <div className="w-full lg:max-w-xl">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition duration-500" />
                  <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-md">
                    <Search className="ml-4 h-5 w-5 text-slate-500" />
                    <SearchInput
                      value={searchQuery}
                      onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                      placeholder="Identify learning module..."
                      className="bg-transparent border-none text-white placeholder:text-slate-600 focus-visible:ring-0 w-full h-12 text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OPERATIONAL CONTENT AREA */}
        <main className="max-w-[1600px] mx-auto px-6 lg:px-10 -mt-10 relative z-20">
          <div className="flex flex-col gap-10">

            {/* FLOATING CONTROL BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 px-6 border-slate-200"
                  onClick={openMobileFilters}
                >
                  <Filter className="h-4 w-4 mr-2 text-indigo-600" /> Filters
                </Button>
                <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                  Nodes Detected: <span className="text-slate-900">{totalCourses}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className={cn("rounded-xl h-11 w-11 transition-all", viewMode === 'grid' ? "bg-slate-900 text-white" : "text-slate-400")}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className={cn("rounded-xl h-11 w-11 transition-all", viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-400")}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* COURSE GRID STREAM */}
            <div className="grid grid-cols-1 gap-10">
              {isLoading ? (
                <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8" : "space-y-4")}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CourseCardSkeleton key={i} size={viewMode} />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="py-24 text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-slate-300">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Matching Sequences</h3>
                  <Button variant="outline" className="rounded-xl uppercase font-black text-[10px]" onClick={() => { setSearchQuery(''); setFilters({ sortBy: 'popular' }); }}>Reset Terminal</Button>
                </div>
              ) : (
                <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8" : "space-y-6")}>
                  {courses.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <CourseCard teacherName={course.teacher?.firstName + ' ' + course.teacher?.lastName || 'Unknown Teacher'} rating={course.averageRating || 0} {...course} size={viewMode} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* PAGINATION FOOTER */}
              <div className="py-12 border-t border-slate-200 flex flex-col items-center gap-6">
                <Pagination />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">End of Result Stream</p>
              </div>
            </div>
          </div>
        </main>

        {/* MOBILE FILTERS DRAWER */}
        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-md bg-white h-full shadow-2xl p-8">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-slate-900 italic uppercase">Filter Nodes</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}><X className="h-6 w-6" /></Button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-120px)]">
                  <CourseFiltersCompact categories={categories} filters={filters} onFiltersChange={(f) => { handleFiltersChange(f); setShowMobileFilters(false); }} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (

    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="relative bg-white border-b border-slate-200/60">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80" />

        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col gap-10">

            {/* Top Row: Brand & View Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

              {/* Aligned Icon + Title Group */}
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Course Catalog
                  </h1>
                  <p className="text-sm font-medium text-slate-500 max-w-md">
                    Browse <span className="text-slate-900 font-bold">{totalCourses}</span> specialized modules curated for your growth.
                  </p>
                </div>
              </div>

              {/* Smooth Animated Toggle */}
              <div className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/40 w-fit relative">
                {[
                  { id: 'grid', label: 'Grid View', icon: Grid3X3 },
                  { id: 'list', label: 'List View', icon: List },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setViewMode(option.id as 'grid' | 'list')}
                    className={cn(
                      "relative flex items-center h-9 px-4 rounded-xl text-xs font-bold transition-colors duration-300 z-10 outline-none",
                      viewMode === option.id ? "text-slate-900" : "text-slate-500 hover:text-slate-800 hover:cursor-pointer"
                    )}
                  >
                    <option.icon className={cn(
                      "h-4 w-4 mr-2 transition-colors",
                      viewMode === option.id ? "text-indigo-600" : "text-slate-400"
                    )} />
                    {option.label}

                    {/* The Animated Pill */}
                    {viewMode === option.id && (
                      <motion.div
                        layoutId="activeViewPill"
                        className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/50 z-[-1]"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: Search & Filters */}
            <div className="flex flex-row items-center gap-4">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <SearchInput
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by title, keywords, or technology..."
                  isLoading={isLoading}
                  className="w-full h-14 pl-12 pr-4 bg-white border-slate-200 rounded-[1.25rem] text-sm transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm"
                />
              </div>
              <Button
                variant="outline"
                onClick={openMobileFilters}
                className=" -mx-4 md:mx-0 md:h-14 md:w-auto px-8 rounded-xl shadow-none border-none md:border-slate-200 bg-white font-black text-[10px] uppercase tracking-[0.15em] text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all md:shadow-sm hover:cursor-pointer justify-center items-center"
              >
                <Filter className="h-4 w-4 mr-3" />
                <div className="hidden md:block">Filter</div>
              </Button>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
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
                    teacherName={
                      course.teacher
                        ? `${course.teacher.firstName} ${course.teacher.lastName}`.trim()
                        : 'Unknown Teacher'
                    }
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
                    category={course.category}
                    createdAt={course.createdAt}
                    updatedAt={course.updatedAt}
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
        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-[100] flex justify-end">
              {/* 1. Backdrop - Glass Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
              />

              {/* 2. Drawer Surface */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="relative w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col"
              >
                {/* Compact Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                      Filters
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                    className="h-8 w-8 rounded-full hover:bg-slate-100"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-5">
                    {!isLoadingCategories && (
                      <CourseFiltersCompact
                        categories={categories}
                        filters={tempFilters}
                        onFiltersChange={setTempFilters}
                      />
                    )}
                  </div>
                </div>

                {/* Floating Action Footer */}
                <div className="p-5 bg-white border-t border-slate-100">
                  <Button
                    className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all"
                    onClick={applyMobileFilters}
                  >
                    Apply Selection
                  </Button>
                  <button
                    onClick={resetMobileFilters}
                    className="w-full mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>

  );
}

export default function CourseCatalogPage(props: CourseCatalogPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-48 rounded mx-auto" />
        </div>
      </div>
    }>
      <CourseCatalogContent {...props} />
    </Suspense>
  );
}
