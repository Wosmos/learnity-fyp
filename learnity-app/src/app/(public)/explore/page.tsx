'use client';

/**
 * Public Courses Page
 * Landing page for browsing all available courses (similar to teachers.html design)
 * Students can browse and click to view course details and enroll
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

const difficultyConfig = {
  BEGINNER: { color: 'emerald', label: 'Beginner' },
  INTERMEDIATE: { color: 'amber', label: 'Intermediate' },
  ADVANCED: { color: 'rose', label: 'Advanced' },
};

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
      params.set('limit', '12');

      const response = await fetch(`/api/courses?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data?.courses || data.courses || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-[#02040a] text-white antialiased">
      {/* Noise Texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-40 top-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
              L
            </div>
            <span className="font-bold text-lg tracking-tight">Learnity</span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm text-gray-400 font-medium">
            <Link href="/courses" className="text-white">Courses</Link>
            <Link href="/teachers" className="hover:text-white transition-colors">Teachers</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          <Link 
            href="/auth/register"
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {courses.length}+ Courses Available
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Learn anything, <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-emerald-200 to-emerald-500">
              anytime.
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            From <strong>Programming</strong> to <strong>Science</strong>. Access high-quality courses from expert instructors.
          </p>

          {/* Search Bar */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-2 rounded-full flex items-center max-w-xl mx-auto">
            <div className="pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white px-4 py-2 w-full placeholder-gray-500"
            />
            <button 
              onClick={() => fetchCourses()}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-full font-bold transition-colors"
            >
              Search
            </button>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs text-gray-500">
            <button
              onClick={() => setSelectedCategory('')}
              className={`border px-3 py-1 rounded-full transition-colors ${
                !selectedCategory 
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' 
                  : 'border-white/10 hover:bg-white/5'
              }`}
            >
              All
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`border px-3 py-1 rounded-full transition-colors ${
                  selectedCategory === cat.id 
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' 
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Strip */}
      <section className="border-y border-white/5 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-white">{courses.length}+</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Courses</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Students</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">4.8/5</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Average Rating</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">24/7</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Access</p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2">Featured Courses</h2>
            <p className="text-gray-400">Start learning from our top-rated courses.</p>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedDifficulty === diff
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {diff ? difficultyConfig[diff as keyof typeof difficultyConfig].label : 'All Levels'}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-white/5 rounded-2xl mb-4" />
                <div className="h-6 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No courses found</h3>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCardPublic key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-t from-emerald-500/10 to-transparent border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to start learning?</h2>
          <p className="text-gray-400 mb-8">Join thousands of students already learning on Learnity.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-black font-bold text-xs">L</div>
            <span className="font-bold text-gray-300">Learnity</span>
          </div>
          <div className="text-gray-500 text-sm">© 2025 Learnity. All rights reserved.</div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <Link href="#" className="hover:text-emerald-500">Privacy</Link>
            <Link href="#" className="hover:text-emerald-500">Terms</Link>
            <Link href="#" className="hover:text-emerald-500">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


// Course Card Component for Public Page
function CourseCardPublic({ course }: { course: CourseData }) {
  const difficulty = difficultyConfig[course.difficulty];
  const difficultyColorClasses = {
    BEGINNER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    INTERMEDIATE: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    ADVANCED: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
  };
  
  return (
    <Link href={`/courses/${course.id}`} className="group">
      <div className="relative h-[420px] rounded-[2rem] overflow-hidden border border-white/10 bg-[#050505] transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/5">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-indigo-500/20 flex items-center justify-center">
              <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${difficultyColorClasses[course.difficulty]}`}>
              {difficulty.label}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            {course.isFree ? (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                Free
              </span>
            ) : course.price ? (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                ${course.price}
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {course.category?.name || 'Course'}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">
            {course.description}
          </p>

          {/* Teacher */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {course.teacher?.avatarUrl ? (
                <Image
                  src={course.teacher.avatarUrl}
                  alt={course.teacher.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                course.teacher?.name?.charAt(0) || 'T'
              )}
            </div>
            <span className="text-sm text-gray-300">{course.teacher?.name || 'Instructor'}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {Number(course.averageRating || 0).toFixed(1)}
              </span>
              <span>{course.enrollmentCount || 0} students</span>
              <span>{course.lessonCount || 0} lessons</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
