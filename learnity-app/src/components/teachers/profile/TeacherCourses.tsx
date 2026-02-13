/**
 * Teacher Courses Section - Shows courses taught by the teacher
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Star,
  Clock,
  Play,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  isFree: boolean;
  price: number | null;
  totalDuration: number; // in seconds
  lessonCount: number;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  category: {
    name: string;
    slug: string;
  };
}

interface TeacherCoursesProps {
  teacherId: string;
  teacherName: string;
}

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-200',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ADVANCED: 'bg-red-100 text-red-800 border-red-200',
};

const difficultyLabels = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function TeacherCourses({
  teacherId,
  teacherName,
}: TeacherCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(`/api/teachers/${teacherId}/courses`);
        const data = await response.json();

        if (data.success) {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Error fetching teacher courses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [teacherId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5 text-indigo-600' />
            Courses by {teacherName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <div key={i} className='animate-pulse'>
                <div className='h-24 bg-gray-200 rounded-lg'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5 text-indigo-600' />
            Courses by {teacherName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <GraduationCap className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>No published courses yet</p>
            <p className='text-sm text-gray-500 mt-1'>
              This teacher is preparing amazing content for you!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedCourses = showAll ? courses : courses.slice(0, 3);
  const hasMore = courses.length > 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BookOpen className='h-5 w-5 text-indigo-600' />
          Courses by {teacherName}
          <Badge variant='secondary' className='ml-auto'>
            {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {displayedCourses.map(course => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className='block group'
            >
              <div className='border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-indigo-200'>
                <div className='flex gap-4'>
                  {/* Course Thumbnail */}
                  <div className='flex-shrink-0'>
                    <div className='w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden'>
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          width={80}
                          height={80}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <Play className='h-8 w-8 text-white' />
                      )}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <h3 className='font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2'>
                        {course.title}
                      </h3>
                      <ChevronRight className='h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0' />
                    </div>

                    <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                      {course.description}
                    </p>

                    {/* Course Meta */}
                    <div className='flex items-center gap-4 mt-3 text-xs text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {formatDuration(course.totalDuration)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <BookOpen className='h-3 w-3' />
                        {course.lessonCount} lessons
                      </div>
                      <div className='flex items-center gap-1'>
                        <Users className='h-3 w-3' />
                        {course.enrollmentCount} students
                      </div>
                      {course.averageRating > 0 && (
                        <div className='flex items-center gap-1'>
                          <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                          {course.averageRating.toFixed(1)} (
                          {course.reviewCount})
                        </div>
                      )}
                    </div>

                    {/* Tags and Difficulty */}
                    <div className='flex items-center gap-2 mt-3'>
                      <Badge
                        variant='outline'
                        className={`text-xs ${difficultyColors[course.difficulty]}`}
                      >
                        {difficultyLabels[course.difficulty]}
                      </Badge>
                      <Badge variant='outline' className='text-xs'>
                        {course.category.name}
                      </Badge>
                      {!course.isFree && course.price && (
                        <Badge
                          variant='outline'
                          className='text-xs bg-green-50 text-green-700 border-green-200'
                        >
                          ${course.price}
                        </Badge>
                      )}
                      {course.isFree && (
                        <Badge
                          variant='outline'
                          className='text-xs bg-blue-50 text-blue-700 border-blue-200'
                        >
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className='mt-6 text-center'>
            <Button
              variant='outline'
              onClick={() => setShowAll(!showAll)}
              className='w-full'
            >
              {showAll ? 'Show Less' : `Show All ${courses.length} Courses`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
