'use client';

/**
 * Course Preview Component
 * Preview course as student would see it
 * Requirements: 2.7
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  Video,
  FileQuestion,
  CheckCircle,
  Lock,
  Play,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';

export function CoursePreview() {
  const { courseData, sections } = useCourseBuilder();

  // Calculate course stats
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalVideos = sections.reduce(
    (acc, s) => acc + s.lessons.filter(l => l.type === 'VIDEO').length,
    0
  );
  const totalQuizzes = sections.reduce(
    (acc, s) => acc + s.lessons.filter(l => l.type === 'QUIZ').length,
    0
  );
  const totalDuration = sections.reduce(
    (acc, s) => acc + s.lessons.reduce((a, l) => a + (l.duration || 0), 0),
    0
  );

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-emerald-100 text-emerald-700';
      case 'INTERMEDIATE':
        return 'bg-amber-100 text-amber-700';
      case 'ADVANCED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Check if course is ready for preview
  const isPreviewReady = courseData.title && courseData.description && sections.length > 0;

  if (!isPreviewReady) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">Preview Not Available</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Complete the basic information and add at least one section with lessons to preview your course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <GraduationCap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Student Preview Mode</p>
          <p className="text-sm text-blue-600">
            This is how your course will appear to students after publishing.
          </p>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail */}
          <div className="w-full md:w-64 flex-shrink-0">
            {courseData.thumbnailUrl ? (
              <img
                src={courseData.thumbnailUrl}
                alt={courseData.title}
                className="w-full h-40 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-40 bg-slate-700 rounded-lg flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-slate-500" />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getDifficultyColor(courseData.difficulty)}>
                {courseData.difficulty}
              </Badge>
              {courseData.isFree ? (
                <Badge className="bg-emerald-100 text-emerald-700">Free</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-700">
                  ${courseData.price?.toFixed(2)}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-2">{courseData.title}</h1>
            <p className="text-slate-300 text-sm mb-4 line-clamp-2">
              {courseData.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span>{totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Video className="h-4 w-4 text-slate-400" />
                <span>{totalVideos} videos</span>
              </div>
              {totalQuizzes > 0 && (
                <div className="flex items-center gap-1.5">
                  <FileQuestion className="h-4 w-4 text-slate-400" />
                  <span>{totalQuizzes} quizzes</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {courseData.tags && courseData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {courseData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-slate-300 border-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Content
          </CardTitle>
          <p className="text-sm text-slate-500">
            {sections.length} sections • {totalLessons} lessons • {formatDuration(totalDuration)} total
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {sections.map((section, sectionIndex) => {
              const sectionDuration = section.lessons.reduce((a, l) => a + (l.duration || 0), 0);
              const videoCount = section.lessons.filter(l => l.type === 'VIDEO').length;
              const quizCount = section.lessons.filter(l => l.type === 'QUIZ').length;

              return (
                <AccordionItem
                  key={sectionIndex}
                  value={`section-${sectionIndex}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50">
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="flex-1">
                        <p className="font-medium">
                          Section {sectionIndex + 1}: {section.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {section.lessons.length} lessons • {formatDuration(sectionDuration)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                            {lesson.type === 'VIDEO' ? (
                              <Play className="h-4 w-4 text-blue-600" />
                            ) : (
                              <FileQuestion className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            {lesson.type === 'VIDEO' && lesson.duration > 0 && (
                              <span>{formatDuration(lesson.duration)}</span>
                            )}
                            {lesson.type === 'QUIZ' && (
                              <Badge variant="outline" className="text-xs">
                                Quiz
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {section.lessons.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No lessons in this section
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Communication Info (if available) */}
      {(courseData.whatsappGroupLink || courseData.contactEmail || courseData.contactWhatsapp) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teacher Contact</CardTitle>
            <p className="text-sm text-slate-500">
              Available to enrolled students only
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {courseData.whatsappGroupLink && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">WhatsApp Group</Badge>
                  <span className="text-slate-500">Available after enrollment</span>
                </div>
              )}
              {courseData.contactEmail && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Email</Badge>
                  <span className="text-slate-500">Available after enrollment</span>
                </div>
              )}
              {courseData.contactWhatsapp && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Direct WhatsApp</Badge>
                  <span className="text-slate-500">Available after enrollment</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enroll Button Preview */}
      <div className="flex justify-center">
        <Button size="lg" className="gap-2" disabled>
          <GraduationCap className="h-5 w-5" />
          {courseData.isFree ? 'Enroll for Free' : `Enroll - $${courseData.price?.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
