'use client';

/**
 * Edit Course Page
 * Page for editing an existing course
 * Requirements: 2.4
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CourseBuilderProvider, CourseBuilderPage, CourseFormData, SectionFormData } from '@/components/course-builder';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { ClientTeacherProtection } from '@/components/auth/ClientTeacherProtection';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseFormData | null>(null);
  const [sections, setSections] = useState<SectionFormData[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await authenticatedFetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        
        const data = await response.json();
        
        // Transform API response to form data
        setCourseData({
          id: data.id,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          difficulty: data.difficulty,
          tags: data.tags || [],
          thumbnailUrl: data.thumbnailUrl,
          isFree: data.isFree,
          price: data.price ? parseFloat(data.price) : undefined,
          requireSequentialProgress: data.requireSequentialProgress,
          whatsappGroupLink: data.whatsappGroupLink,
          contactEmail: data.contactEmail,
          contactWhatsapp: data.contactWhatsapp,
          status: data.status,
        });

        // Transform sections
        const transformedSections: SectionFormData[] = (data.sections || []).map(
          (section: { id: string; title: string; description?: string; order: number; lessons: Array<{
            id: string;
            title: string;
            description?: string;
            type: 'VIDEO' | 'QUIZ';
            youtubeUrl?: string;
            youtubeId?: string;
            duration: number;
            order: number;
            quiz?: {
              id: string;
              title: string;
              description?: string;
              passingScore: number;
              questions: Array<{
                id: string;
                question: string;
                options: string[];
                correctOptionIndex: number;
                explanation?: string;
                order: number;
              }>;
            };
          }> }) => ({
            id: section.id,
            title: section.title,
            description: section.description,
            order: section.order,
            lessons: (section.lessons || []).map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              type: lesson.type,
              youtubeUrl: lesson.youtubeUrl,
              youtubeId: lesson.youtubeId,
              duration: lesson.duration,
              order: lesson.order,
              quiz: lesson.quiz ? {
                id: lesson.quiz.id,
                title: lesson.quiz.title,
                description: lesson.quiz.description,
                passingScore: lesson.quiz.passingScore,
                questions: (lesson.quiz.questions || []).map((q) => ({
                  id: q.id,
                  question: q.question,
                  options: q.options,
                  correctOptionIndex: q.correctOptionIndex,
                  explanation: q.explanation,
                  order: q.order,
                })),
              } : undefined,
            })),
          })
        );
        
        setSections(transformedSections);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, authenticatedFetch]);

  if (isLoading) {
    return (
      <ClientTeacherProtection>
        <AuthenticatedLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600">Loading course...</p>
              </CardContent>
            </Card>
          </div>
        </AuthenticatedLayout>
      </ClientTeacherProtection>
    );
  }

  if (error || !courseData) {
    return (
      <ClientTeacherProtection>
        <AuthenticatedLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
                <a href="/dashboard/teacher/courses" className="text-blue-600 hover:underline">
                  Back to courses
                </a>
              </CardContent>
            </Card>
          </div>
        </AuthenticatedLayout>
      </ClientTeacherProtection>
    );
  }

  return (
    <ClientTeacherProtection>
      <AuthenticatedLayout>
        <CourseBuilderProvider
          initialCourse={courseData}
          initialSections={sections}
          courseId={courseId}
        >
          <CourseBuilderPage courseId={courseId} />
        </CourseBuilderProvider>
      </AuthenticatedLayout>
    </ClientTeacherProtection>
  );
}
