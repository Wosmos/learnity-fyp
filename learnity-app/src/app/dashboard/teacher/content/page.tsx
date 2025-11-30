'use client';

/**
 * Teacher Content Page
 * Redirects to courses page - content is managed within courses
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherContentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to courses page since content is managed within courses
    router.replace('/dashboard/teacher/courses');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Redirecting to courses...</p>
    </div>
  );
}
