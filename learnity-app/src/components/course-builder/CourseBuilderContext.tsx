'use client';

/**
 * Course Builder Context
 * Provides state management for the course builder
 * Requirements: 1.1-1.10
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  CourseBuilderContextType,
  CourseBuilderStep,
  CourseFormData,
  SectionFormData,
  LessonFormData,
} from './types';

const defaultCourseData: CourseFormData = {
  title: '',
  description: '',
  categoryId: '',
  difficulty: 'BEGINNER',
  tags: [],
  isFree: true,
  requireSequentialProgress: false,
};

const CourseBuilderContext = createContext<CourseBuilderContextType | undefined>(undefined);

interface CourseBuilderProviderProps {
  children: ReactNode;
  initialCourse?: CourseFormData;
  initialSections?: SectionFormData[];
  courseId?: string;
}

export function CourseBuilderProvider({
  children,
  initialCourse,
  initialSections = [],
  courseId,
}: CourseBuilderProviderProps) {
  const { toast } = useToast();
  const [courseData, setCourseDataState] = useState<CourseFormData>(
    initialCourse || defaultCourseData
  );
  const [sections, setSectionsState] = useState<SectionFormData[]>(initialSections);
  const [currentStep, setCurrentStep] = useState<CourseBuilderStep>('basic-info');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setCourseData = useCallback((data: Partial<CourseFormData>) => {
    setCourseDataState((prev) => ({ ...prev, ...data }));
    setIsDirty(true);
  }, []);

  const setSections = useCallback((newSections: SectionFormData[]) => {
    setSectionsState(newSections);
    setIsDirty(true);
  }, []);

  const addSection = useCallback((section: Omit<SectionFormData, 'order'>) => {
    setSectionsState((prev) => [
      ...prev,
      { ...section, order: prev.length, lessons: section.lessons || [] },
    ]);
    setIsDirty(true);
  }, []);

  const updateSection = useCallback((index: number, section: Partial<SectionFormData>) => {
    setSectionsState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...section };
      return updated;
    });
    setIsDirty(true);
  }, []);

  const deleteSection = useCallback((index: number) => {
    setSectionsState((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((s, i) => ({ ...s, order: i }));
    });
    setIsDirty(true);
  }, []);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setSectionsState((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated.map((s, i) => ({ ...s, order: i }));
    });
    setIsDirty(true);
  }, []);

  const addLesson = useCallback(
    (sectionIndex: number, lesson: Omit<LessonFormData, 'order'>) => {
      setSectionsState((prev) => {
        const updated = [...prev];
        const section = { ...updated[sectionIndex] };
        section.lessons = [
          ...section.lessons,
          { ...lesson, order: section.lessons.length },
        ];
        updated[sectionIndex] = section;
        return updated;
      });
      setIsDirty(true);
    },
    []
  );

  const updateLesson = useCallback(
    (sectionIndex: number, lessonIndex: number, lesson: Partial<LessonFormData>) => {
      setSectionsState((prev) => {
        const updated = [...prev];
        const section = { ...updated[sectionIndex] };
        section.lessons = [...section.lessons];
        section.lessons[lessonIndex] = { ...section.lessons[lessonIndex], ...lesson };
        updated[sectionIndex] = section;
        return updated;
      });
      setIsDirty(true);
    },
    []
  );

  const deleteLesson = useCallback((sectionIndex: number, lessonIndex: number) => {
    setSectionsState((prev) => {
      const updated = [...prev];
      const section = { ...updated[sectionIndex] };
      section.lessons = section.lessons
        .filter((_, i) => i !== lessonIndex)
        .map((l, i) => ({ ...l, order: i }));
      updated[sectionIndex] = section;
      return updated;
    });
    setIsDirty(true);
  }, []);

  const reorderLessons = useCallback(
    (sectionIndex: number, fromIndex: number, toIndex: number) => {
      setSectionsState((prev) => {
        const updated = [...prev];
        const section = { ...updated[sectionIndex] };
        const lessons = [...section.lessons];
        const [removed] = lessons.splice(fromIndex, 1);
        lessons.splice(toIndex, 0, removed);
        section.lessons = lessons.map((l, i) => ({ ...l, order: i }));
        updated[sectionIndex] = section;
        return updated;
      });
      setIsDirty(true);
    },
    []
  );

  const validateCourse = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!courseData.title || courseData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!courseData.description || courseData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!courseData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [courseData]);

  const saveDraft = useCallback(async () => {
    if (!validateCourse()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = courseId ? `/api/courses/${courseId}` : '/api/courses';
      const method = courseId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      const savedCourse = await response.json();

      // Save sections if course was created
      if (!courseId && savedCourse.id) {
        for (const section of sections) {
          await fetch(`/api/courses/${savedCourse.id}/sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(section),
          });
        }
      }

      setIsDirty(false);
      toast({
        title: 'Success',
        description: 'Course saved as draft',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save course',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [courseData, sections, courseId, validateCourse, toast]);

  const publishCourse = useCallback(async () => {
    if (!courseId) {
      toast({
        title: 'Error',
        description: 'Please save the course first',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish course');
      }

      toast({
        title: 'Success',
        description: 'Course published successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish course',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [courseId, toast]);

  const value: CourseBuilderContextType = {
    courseData,
    sections,
    currentStep,
    isLoading,
    isSaving,
    isDirty,
    errors,
    setCourseData,
    setSections,
    setCurrentStep,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    saveDraft,
    publishCourse,
    validateCourse,
  };

  return (
    <CourseBuilderContext.Provider value={value}>
      {children}
    </CourseBuilderContext.Provider>
  );
}

export function useCourseBuilder() {
  const context = useContext(CourseBuilderContext);
  if (!context) {
    throw new Error('useCourseBuilder must be used within a CourseBuilderProvider');
  }
  return context;
}
