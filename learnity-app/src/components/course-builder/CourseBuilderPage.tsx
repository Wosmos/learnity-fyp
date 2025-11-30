'use client';

/**
 * Course Builder Page Layout
 * Multi-step form with tabbed interface for course creation
 * Requirements: 1.1-1.10
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Layers, 
  Eye, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';
import { CourseBasicInfoForm } from './CourseBasicInfoForm';
import { SectionManager } from './SectionManager';
import { CoursePreview } from './CoursePreview';
import { PublishCourseDialog } from './PublishCourseDialog';
import { CourseBuilderStep } from './types';

interface CourseBuilderPageProps {
  courseId?: string;
}

export function CourseBuilderPage({ courseId }: CourseBuilderPageProps) {
  const router = useRouter();
  const {
    courseData,
    sections,
    currentStep,
    setCurrentStep,
    isSaving,
    isDirty,
    saveDraft,
    errors,
  } = useCourseBuilder();

  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Calculate completion status for each step
  const basicInfoComplete = 
    courseData.title.length >= 3 && 
    courseData.description.length >= 10 && 
    courseData.categoryId;

  const sectionsComplete = sections.length > 0 && sections.some(s => s.lessons.length > 0);

  const getStepStatus = (step: CourseBuilderStep) => {
    switch (step) {
      case 'basic-info':
        return basicInfoComplete ? 'complete' : Object.keys(errors).length > 0 ? 'error' : 'pending';
      case 'sections':
        return sectionsComplete ? 'complete' : 'pending';
      case 'preview':
        return basicInfoComplete && sectionsComplete ? 'ready' : 'pending';
      default:
        return 'pending';
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentStep(value as CourseBuilderStep);
  };

  const handleSaveDraft = async () => {
    await saveDraft();
  };

  const handleBack = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/dashboard/teacher/content');
      }
    } else {
      router.push('/dashboard/teacher/content');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {courseId ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-sm text-slate-500">
                  {courseData.title || 'Untitled Course'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isDirty && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                  Unsaved changes
                </Badge>
              )}
              {courseData.status && (
                <Badge 
                  variant="outline" 
                  className={
                    courseData.status === 'PUBLISHED' 
                      ? 'text-emerald-600 border-emerald-300 bg-emerald-50'
                      : courseData.status === 'DRAFT'
                      ? 'text-slate-600 border-slate-300 bg-slate-50'
                      : 'text-amber-600 border-amber-300 bg-amber-50'
                  }
                >
                  {courseData.status}
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowPublishDialog(true)}
                disabled={!basicInfoComplete || !sectionsComplete}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Publish Course
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentStep} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white shadow-sm border">
            <TabsTrigger value="basic-info" className="gap-2 data-[state=active]:bg-blue-50">
              <StepIndicator status={getStepStatus('basic-info')} />
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="gap-2 data-[state=active]:bg-blue-50">
              <StepIndicator status={getStepStatus('sections')} />
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-blue-50">
              <StepIndicator status={getStepStatus('preview')} />
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  Set up the basic details for your course. This information will be visible to students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseBasicInfoForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  Organize your course into sections and add lessons. You can reorder items by dragging.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
                <CardDescription>
                  See how your course will appear to students before publishing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CoursePreview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Publish Dialog */}
      <PublishCourseDialog 
        open={showPublishDialog} 
        onOpenChange={setShowPublishDialog}
      />
    </div>
  );
}

// Step indicator component
function StepIndicator({ status }: { status: 'pending' | 'complete' | 'error' | 'ready' }) {
  switch (status) {
    case 'complete':
    case 'ready':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <div className="h-2 w-2 rounded-full bg-slate-300" />;
  }
}
