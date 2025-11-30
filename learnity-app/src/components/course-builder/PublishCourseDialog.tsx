'use client';

/**
 * Publish Course Dialog Component
 * Validation checklist and publish/unpublish actions
 * Requirements: 2.1, 2.2, 2.3
 */

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Rocket,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';

interface PublishCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationItem {
  label: string;
  passed: boolean;
  required: boolean;
  message?: string;
}

export function PublishCourseDialog({ open, onOpenChange }: PublishCourseDialogProps) {
  const { courseData, sections, publishCourse, isSaving } = useCourseBuilder();

  // Calculate validation items
  const validationItems = useMemo((): ValidationItem[] => {
    const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const totalVideos = sections.reduce(
      (acc, s) => acc + s.lessons.filter(l => l.type === 'VIDEO').length,
      0
    );
    const sectionsWithLessons = sections.filter(s => s.lessons.length > 0).length;

    return [
      {
        label: 'Course title (3-100 characters)',
        passed: courseData.title.length >= 3 && courseData.title.length <= 100,
        required: true,
        message: courseData.title.length < 3 
          ? 'Title is too short' 
          : courseData.title.length > 100 
          ? 'Title is too long' 
          : undefined,
      },
      {
        label: 'Course description (10-2000 characters)',
        passed: courseData.description.length >= 10 && courseData.description.length <= 2000,
        required: true,
        message: courseData.description.length < 10 
          ? 'Description is too short' 
          : courseData.description.length > 2000 
          ? 'Description is too long' 
          : undefined,
      },
      {
        label: 'Category selected',
        passed: !!courseData.categoryId,
        required: true,
        message: !courseData.categoryId ? 'Please select a category' : undefined,
      },
      {
        label: 'At least one section',
        passed: sections.length > 0,
        required: true,
        message: sections.length === 0 ? 'Add at least one section' : undefined,
      },
      {
        label: 'At least one lesson',
        passed: totalLessons > 0,
        required: true,
        message: totalLessons === 0 ? 'Add at least one lesson' : undefined,
      },
      {
        label: 'Section with lessons',
        passed: sectionsWithLessons > 0,
        required: true,
        message: sectionsWithLessons === 0 ? 'At least one section must have lessons' : undefined,
      },
      {
        label: 'Course thumbnail',
        passed: !!courseData.thumbnailUrl,
        required: false,
        message: !courseData.thumbnailUrl ? 'Recommended for better visibility' : undefined,
      },
      {
        label: 'Course tags',
        passed: (courseData.tags?.length || 0) > 0,
        required: false,
        message: (courseData.tags?.length || 0) === 0 ? 'Tags help students find your course' : undefined,
      },
    ];
  }, [courseData, sections]);

  // Check if all required items pass
  const allRequiredPassed = validationItems
    .filter(item => item.required)
    .every(item => item.passed);

  // Count passed items
  const passedCount = validationItems.filter(item => item.passed).length;
  const totalCount = validationItems.length;

  // Handle publish
  const handlePublish = async () => {
    if (!allRequiredPassed) return;
    await publishCourse();
    onOpenChange(false);
  };

  // Check if course is already published
  const isPublished = courseData.status === 'PUBLISHED';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPublished ? (
              <>
                <Eye className="h-5 w-5 text-emerald-600" />
                Course Published
              </>
            ) : (
              <>
                <Rocket className="h-5 w-5 text-blue-600" />
                Publish Course
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isPublished
              ? 'Your course is live and visible to students.'
              : 'Review the checklist below before publishing your course.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">Checklist Progress</span>
              <span className="font-medium">
                {passedCount}/{totalCount} items
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  allRequiredPassed ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${(passedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Validation checklist */}
          <div className="space-y-2">
            {validationItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  item.passed
                    ? 'bg-emerald-50'
                    : item.required
                    ? 'bg-red-50'
                    : 'bg-amber-50'
                }`}
              >
                {item.passed ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                ) : item.required ? (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.passed
                        ? 'text-emerald-700'
                        : item.required
                        ? 'text-red-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {item.label}
                    {item.required && !item.passed && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </p>
                  {item.message && !item.passed && (
                    <p
                      className={`text-xs mt-0.5 ${
                        item.required ? 'text-red-600' : 'text-amber-600'
                      }`}
                    >
                      {item.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Warning for unpublished changes */}
          {isPublished && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Any changes you make will be visible to students immediately.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isPublished ? 'Close' : 'Cancel'}
          </Button>
          
          {isPublished ? (
            <Button
              variant="outline"
              className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
              onClick={async () => {
                // Unpublish logic would go here
                onOpenChange(false);
              }}
            >
              <EyeOff className="h-4 w-4" />
              Unpublish Course
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={!allRequiredPassed || isSaving}
              className="gap-2"
            >
              <Rocket className="h-4 w-4" />
              {isSaving ? 'Publishing...' : 'Publish Course'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
