'use client';

/**
 * New Course Page
 * Page for creating a new course
 * Requirements: 1.1-1.10
 */

import React from 'react';
import { CourseBuilderProvider, CourseBuilderPage } from '@/components/course-builder';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { ClientTeacherProtection } from '@/components/auth/ClientTeacherProtection';

export default function NewCoursePage() {
  return (
    <ClientTeacherProtection>
      <AuthenticatedLayout>
        <CourseBuilderProvider>
          <CourseBuilderPage />
        </CourseBuilderProvider>
      </AuthenticatedLayout>
    </ClientTeacherProtection>
  );
}
