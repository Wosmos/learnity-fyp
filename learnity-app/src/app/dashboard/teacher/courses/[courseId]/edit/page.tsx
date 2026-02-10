'use client';

/**
 * Simplified Course Editor Page
 * All-in-one page for editing course details, sections, and lessons
 * Requirements: 2.4
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Video,
  FileText,
  GripVertical,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Eye,
  BookOpen,
  Layers,
  HelpCircle,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id?: string;
  title: string;
  description?: string;
  type: 'VIDEO' | 'QUIZ';
  youtubeUrl?: string;
  duration: number;
  order: number;
  quiz?: Quiz;
}

interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface Quiz {
  id?: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuizQuestion[];
}

interface Section {
  id?: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags: string[];
  isFree: boolean;
  price?: number;
  status?: string;
  whatsappGroupLink?: string;
  contactEmail?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const { user, loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Course data
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'BEGINNER',
    tags: [],
    isFree: true,
    price: 0,
  });
  const [sections, setSections] = useState<Section[]>([]);

  // Dialog states
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  );
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [lessonType, setLessonType] = useState<'VIDEO' | 'QUIZ'>('VIDEO');
  const [newLesson, setNewLesson] = useState<Lesson>({
    title: '',
    youtubeUrl: '',
    type: 'VIDEO',
    duration: 0,
    order: 0,
  });

  // Quiz builder state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
    },
  ]);
  const [quizPassingScore, setQuizPassingScore] = useState(70);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in data
        const categoriesArray = Array.isArray(data) ? data : data.data || [];
        setCategories(categoriesArray);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setError('Please log in to edit courses');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch course');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;

      setCourseData({
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        categoryId: data.categoryId || '',
        difficulty: data.difficulty || 'BEGINNER',
        tags: data.tags || [],
        isFree: data.isFree ?? true,
        price: data.price ? Number(data.price) : 0,
        status: data.status,
        whatsappGroupLink: data.whatsappGroupLink,
        contactEmail: data.contactEmail,
      });

      // Transform sections
      const transformedSections: Section[] = (data.sections || []).map(
        (section: {
          id: string;
          title: string;
          description?: string;
          order: number;
          lessons: Lesson[];
        }) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          order: section.order,
          lessons: (section.lessons || []).map((lesson: Lesson) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            type: lesson.type || 'VIDEO',
            youtubeUrl: lesson.youtubeUrl,
            duration: lesson.duration || 0,
            order: lesson.order,
          })),
        })
      );
      setSections(transformedSections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user, authLoading, authenticatedFetch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!authLoading) {
      fetchCourse();
    }
  }, [authLoading, fetchCourse]);

  // Save course
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update course basic info
      const courseResponse = await authenticatedFetch(
        `/api/courses/${courseId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: courseData.title,
            description: courseData.description,
            categoryId: courseData.categoryId,
            difficulty: courseData.difficulty,
            tags: courseData.tags,
            isFree: courseData.isFree,
            price: courseData.isFree ? 0 : Number(courseData.price),
            whatsappGroupLink: courseData.whatsappGroupLink,
            contactEmail: courseData.contactEmail,
          }),
        }
      );

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json();
        throw new Error(errorData.error?.message || 'Failed to save course');
      }

      toast({ title: 'Success', description: 'Course saved successfully!' });
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to save course',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish course
  const handlePublish = async () => {
    try {
      setIsSaving(true);
      const response = await authenticatedFetch(
        `/api/courses/${courseId}/publish`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to publish course');
      }

      toast({
        title: 'Success',
        description: 'Course published successfully!',
      });
      setCourseData(prev => ({ ...prev, status: 'PUBLISHED' }));
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to publish course',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add section
  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;

    try {
      const response = await authenticatedFetch(
        `/api/courses/${courseId}/sections`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: newSectionTitle,
            order: sections.length,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add section');
      }

      const data = await response.json();
      setSections([...sections, { ...data.data, lessons: [] }]);
      setNewSectionTitle('');
      setShowAddSection(false);
      toast({ title: 'Success', description: 'Section added!' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add section',
        variant: 'destructive',
      });
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId: string, index: number) => {
    if (!confirm('Delete this section and all its lessons?')) return;

    try {
      const response = await authenticatedFetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      setSections(sections.filter((_, i) => i !== index));
      toast({ title: 'Success', description: 'Section deleted!' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      });
    }
  };

  // Add lesson (video or quiz)
  const handleAddLesson = async () => {
    if (currentSectionIndex === null || !newLesson.title.trim()) return;

    const section = sections[currentSectionIndex];
    if (!section.id) return;

    try {
      // Create the lesson first
      const lessonResponse = await authenticatedFetch(
        `/api/sections/${section.id}/lessons`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: newLesson.title,
            description: newLesson.description,
            type: lessonType,
            youtubeUrl:
              lessonType === 'VIDEO' ? newLesson.youtubeUrl : undefined,
            duration: newLesson.duration || 0,
            order: section.lessons.length,
          }),
        }
      );

      if (!lessonResponse.ok) {
        throw new Error('Failed to add lesson');
      }

      const lessonData = await lessonResponse.json();
      const createdLesson = lessonData.data;

      // If it's a quiz, create the quiz with questions
      if (lessonType === 'QUIZ' && createdLesson.id) {
        const validQuestions = quizQuestions.filter(
          q => q.question.trim() && q.options.some(o => o.trim())
        );

        if (validQuestions.length === 0) {
          toast({
            title: 'Error',
            description: 'Please add at least one question',
            variant: 'destructive',
          });
          return;
        }

        const quizResponse = await authenticatedFetch(
          `/api/lessons/${createdLesson.id}/quiz`,
          {
            method: 'POST',
            body: JSON.stringify({
              title: newLesson.title,
              description: newLesson.description,
              passingScore: quizPassingScore,
              questions: validQuestions.map((q, idx) => ({
                question: q.question,
                options: q.options.filter(o => o.trim()),
                correctOptionIndex: q.correctOptionIndex,
                explanation: q.explanation,
                order: idx,
              })),
            }),
          }
        );

        if (!quizResponse.ok) {
          // Delete the lesson if quiz creation failed
          await authenticatedFetch(`/api/lessons/${createdLesson.id}`, {
            method: 'DELETE',
          });
          throw new Error('Failed to create quiz');
        }
      }

      const updatedSections = [...sections];
      updatedSections[currentSectionIndex].lessons.push(createdLesson);
      setSections(updatedSections);

      // Reset form
      setNewLesson({
        title: '',
        youtubeUrl: '',
        type: 'VIDEO',
        duration: 0,
        order: 0,
      });
      setLessonType('VIDEO');
      setQuizQuestions([
        {
          question: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          explanation: '',
        },
      ]);
      setQuizPassingScore(70);
      setShowAddLesson(false);
      toast({
        title: 'Success',
        description: `${lessonType === 'QUIZ' ? 'Quiz' : 'Lesson'} added!`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to add lesson',
        variant: 'destructive',
      });
    }
  };

  // Quiz question helpers
  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (quizQuestions.length > 1) {
      setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion,
    value: string | number | string[]
  ) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...quizQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setQuizQuestions(updated);
  };

  // Delete lesson
  const handleDeleteLesson = async (
    sectionIndex: number,
    lessonId: string,
    lessonIndex: number
  ) => {
    if (!confirm('Delete this lesson?')) return;

    try {
      const response = await authenticatedFetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      const updatedSections = [...sections];
      updatedSections[sectionIndex].lessons = updatedSections[
        sectionIndex
      ].lessons.filter((_, i) => i !== lessonIndex);
      setSections(updatedSections);
      toast({ title: 'Success', description: 'Lesson deleted!' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  // Calculate stats
  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const canPublish =
    courseData.title &&
    courseData.description &&
    courseData.categoryId &&
    sections.length > 0 &&
    totalLessons > 0;

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-[1600px] mx-auto px-4 py-8'>
          <Skeleton className='h-8 w-48 mb-8' />
          <Skeleton className='h-64 w-full mb-4' />
          <Skeleton className='h-48 w-full' />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
            <p className='text-red-600 mb-4'>{error}</p>
            <Link href='/dashboard/teacher/courses'>
              <Button variant='outline'>Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b sticky top-0 z-10'>
        <div className='max-w-[1600px] mx-auto px-4'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-4'>
              <Link href='/dashboard/teacher/courses'>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className='text-lg font-bold text-slate-900'>
                  {courseData.title || 'Edit Course'}
                </h1>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge
                    variant={
                      courseData.status === 'PUBLISHED'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {courseData.status || 'DRAFT'}
                  </Badge>
                  <span className='text-sm text-slate-500'>
                    {sections.length} sections • {totalLessons} lessons
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className='h-4 w-4 mr-2' />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              {courseData.status !== 'PUBLISHED' && (
                <Button
                  size='sm'
                  onClick={handlePublish}
                  disabled={isSaving || !canPublish}
                  className='bg-emerald-600 hover:bg-emerald-700'
                >
                  <Globe className='h-4 w-4 mr-2' />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-[1600px] mx-auto px-4 py-8 space-y-6'>
        {/* Publishing Requirements */}
        {!canPublish && (
          <Card className='border-amber-200 bg-amber-50'>
            <CardContent className='py-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='h-5 w-5 text-amber-600 mt-0.5' />
                <div>
                  <p className='font-medium text-amber-800'>
                    To publish your course, you need:
                  </p>
                  <ul className='text-sm text-amber-700 mt-1 space-y-1'>
                    {!courseData.title && <li>• Add a course title</li>}
                    {!courseData.description && (
                      <li>• Add a course description</li>
                    )}
                    {!courseData.categoryId && <li>• Select a category</li>}
                    {sections.length === 0 && (
                      <li>• Add at least one section</li>
                    )}
                    {totalLessons === 0 && <li>• Add at least one lesson</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              Course Details
            </CardTitle>
            <CardDescription>
              Basic information about your course
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Course Title *</Label>
                <Input
                  id='title'
                  value={courseData.title}
                  onChange={e =>
                    setCourseData({ ...courseData, title: e.target.value })
                  }
                  placeholder='e.g., Introduction to Web Development'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select
                  value={courseData.categoryId}
                  onValueChange={value =>
                    setCourseData({ ...courseData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                value={courseData.description}
                onChange={e =>
                  setCourseData({ ...courseData, description: e.target.value })
                }
                placeholder='Describe what students will learn...'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='difficulty'>Difficulty Level</Label>
                <Select
                  value={courseData.difficulty}
                  onValueChange={(
                    value: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
                  ) => setCourseData({ ...courseData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='BEGINNER'>Beginner</SelectItem>
                    <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
                    <SelectItem value='ADVANCED'>Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='whatsapp'>WhatsApp Group Link (optional)</Label>
                <Input
                  id='whatsapp'
                  value={courseData.whatsappGroupLink || ''}
                  onChange={e =>
                    setCourseData({
                      ...courseData,
                      whatsappGroupLink: e.target.value,
                    })
                  }
                  placeholder='https://chat.whatsapp.com/...'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100'>
              <div className='space-y-3'>
                <Label className='text-base font-bold text-slate-900'>
                  Pricing Strategy
                </Label>
                <div className='flex gap-3'>
                  <Button
                    type='button'
                    variant={courseData.isFree ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setCourseData({ ...courseData, isFree: true, price: 0 })
                    }
                    className='flex-1 rounded-xl h-11 uppercase font-black text-[10px] tracking-widest'
                  >
                    Free Access
                  </Button>
                  <Button
                    type='button'
                    variant={!courseData.isFree ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setCourseData({ ...courseData, isFree: false })
                    }
                    className='flex-1 rounded-xl h-11 uppercase font-black text-[10px] tracking-widest'
                  >
                    Premium Access
                  </Button>
                </div>
              </div>

              {!courseData.isFree && (
                <div className='space-y-3 animate-in fade-in slide-in-from-top-2 duration-300'>
                  <Label
                    htmlFor='price'
                    className='text-base font-bold text-slate-900'
                  >
                    Course Fee (PKR)
                  </Label>
                  <div className='relative'>
                    <span className='absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold'>
                     Rs
                    </span>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      min='0'
                      value={courseData.price}
                      onChange={e =>
                        setCourseData({
                          ...courseData,
                          price: Number(e.target.value),
                        })
                      }
                      className='pl-8 h-11 rounded-xl font-bold border-2 focus-visible:ring-indigo-500 transition-all'
                      placeholder='99.99'
                    />
                  </div>
                  <p className='text-xs text-slate-500 font-medium'>
                    Set a competitive price for your premium educational
                    content.
                  </p>
                </div>
              )}

              {courseData.isFree && (
                <div className='flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300'>
                  <div className='h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600'>
                    <CheckCircle className='h-4 w-4' />
                  </div>
                  <p className='text-xs font-bold text-emerald-700'>
                    This course is currently FREE. Anyone can enroll instantly.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sections & Lessons */}
        <Card>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Layers className='h-5 w-5' />
                  Course Content
                </CardTitle>
                <CardDescription>
                  Organize your course into sections, then add video lessons to
                  each section
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddSection(true)} size='sm'>
                <Plus className='h-4 w-4 mr-2' />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className='text-center py-12 border-2 border-dashed rounded-lg'>
                <Layers className='h-12 w-12 text-slate-300 mx-auto mb-3' />
                <p className='text-slate-600 mb-4'>No sections yet</p>
                <p className='text-sm text-slate-500 mb-4'>
                  Start by adding a section (like &quot;Chapter 1&quot; or
                  &quot;Introduction&quot;),
                  <br />
                  then add video lessons to each section.
                </p>
                <Button
                  onClick={() => setShowAddSection(true)}
                  variant='outline'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Your First Section
                </Button>
              </div>
            ) : (
              <Accordion type='multiple' className='space-y-2'>
                {sections.map((section, sectionIndex) => (
                  <AccordionItem
                    key={section.id || sectionIndex}
                    value={`section-${sectionIndex}`}
                    className='border rounded-lg px-4'
                  >
                    <AccordionTrigger className='hover:no-underline'>
                      <div className='flex items-center gap-3 flex-1'>
                        <GripVertical className='h-4 w-4 text-slate-400' />
                        <span className='font-medium'>{section.title}</span>
                        <Badge variant='secondary' className='ml-2'>
                          {section.lessons.length} lessons
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='pt-2 pb-4'>
                      <div className='space-y-2'>
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id || lessonIndex}
                            className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'
                          >
                            <div className='flex items-center gap-3'>
                              {lesson.type === 'QUIZ' ? (
                                <HelpCircle className='h-4 w-4 text-purple-500' />
                              ) : (
                                <Video className='h-4 w-4 text-blue-500' />
                              )}
                              <span className='text-sm'>{lesson.title}</span>
                              <Badge variant='outline' className='text-xs'>
                                {lesson.type === 'QUIZ' ? 'Quiz' : 'Video'}
                              </Badge>
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                lesson.id &&
                                handleDeleteLesson(
                                  sectionIndex,
                                  lesson.id,
                                  lessonIndex
                                )
                              }
                            >
                              <Trash2 className='h-4 w-4 text-red-500' />
                            </Button>
                          </div>
                        ))}

                        <div className='flex gap-2 pt-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setCurrentSectionIndex(sectionIndex);
                              setShowAddLesson(true);
                            }}
                          >
                            <Plus className='h-4 w-4 mr-2' />
                            Add Lesson
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              section.id &&
                              handleDeleteSection(section.id, sectionIndex)
                            }
                            className='text-red-600 hover:text-red-700'
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
                            Delete Section
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className='flex justify-between items-center pt-4'>
          <Link href={`/courses/${courseId}`}>
            <Button variant='outline'>
              <Eye className='h-4 w-4 mr-2' />
              Preview Course
            </Button>
          </Link>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleSave} disabled={isSaving}>
              <Save className='h-4 w-4 mr-2' />
              Save Changes
            </Button>
            {courseData.status !== 'PUBLISHED' && canPublish && (
              <Button
                onClick={handlePublish}
                disabled={isSaving}
                className='bg-emerald-600 hover:bg-emerald-700'
              >
                <Globe className='h-4 w-4 mr-2' />
                Publish Course
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Add Section Dialog */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Sections help organize your course content (e.g., &quot;Chapter
              1&quot;, &quot;Introduction&quot;)
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='sectionTitle'>Section Title</Label>
              <Input
                id='sectionTitle'
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                placeholder='e.g., Getting Started'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowAddSection(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionTitle.trim()}
            >
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
        <DialogContent
          className={
            lessonType === 'QUIZ'
              ? 'max-w-2xl max-h-[90vh] overflow-y-auto'
              : ''
          }
        >
          <DialogHeader>
            <DialogTitle>
              Add New {lessonType === 'QUIZ' ? 'Quiz' : 'Lesson'}
            </DialogTitle>
            <DialogDescription>
              {lessonType === 'QUIZ'
                ? 'Create a quiz with multiple choice questions'
                : 'Add a video lesson by pasting a YouTube URL'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {/* Lesson Type Selector */}
            <div className='space-y-2'>
              <Label>Lesson Type</Label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={lessonType === 'VIDEO' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setLessonType('VIDEO')}
                  className='flex-1'
                >
                  <Video className='h-4 w-4 mr-2' />
                  Video
                </Button>
                <Button
                  type='button'
                  variant={lessonType === 'QUIZ' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setLessonType('QUIZ')}
                  className='flex-1'
                >
                  <HelpCircle className='h-4 w-4 mr-2' />
                  Quiz
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lessonTitle'>
                {lessonType === 'QUIZ' ? 'Quiz' : 'Lesson'} Title *
              </Label>
              <Input
                id='lessonTitle'
                value={newLesson.title}
                onChange={e =>
                  setNewLesson({ ...newLesson, title: e.target.value })
                }
                placeholder={
                  lessonType === 'QUIZ'
                    ? 'e.g., Chapter 1 Quiz'
                    : 'e.g., Introduction to Variables'
                }
              />
            </div>

            {lessonType === 'VIDEO' ? (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='youtubeUrl'>YouTube Video URL</Label>
                  <Input
                    id='youtubeUrl'
                    value={newLesson.youtubeUrl || ''}
                    onChange={e =>
                      setNewLesson({ ...newLesson, youtubeUrl: e.target.value })
                    }
                    placeholder='https://www.youtube.com/watch?v=...'
                  />
                  <p className='text-xs text-slate-500'>
                    Paste a YouTube video link. The video will be embedded in
                    your lesson.
                  </p>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lessonDescription'>
                    Description (optional)
                  </Label>
                  <Textarea
                    id='lessonDescription'
                    value={newLesson.description || ''}
                    onChange={e =>
                      setNewLesson({
                        ...newLesson,
                        description: e.target.value,
                      })
                    }
                    placeholder='Brief description of what this lesson covers...'
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Quiz Settings */}
                <div className='space-y-2'>
                  <Label htmlFor='passingScore'>Passing Score (%)</Label>
                  <Input
                    id='passingScore'
                    type='number'
                    min={1}
                    max={100}
                    value={quizPassingScore}
                    onChange={e => setQuizPassingScore(Number(e.target.value))}
                  />
                  <p className='text-xs text-slate-500'>
                    Students need this score to pass (default: 70%)
                  </p>
                </div>

                {/* Questions */}
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <Label>Questions</Label>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addQuestion}
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      Add Question
                    </Button>
                  </div>

                  {quizQuestions.map((q, qIndex) => (
                    <Card key={qIndex} className='p-4'>
                      <div className='space-y-3'>
                        <div className='flex justify-between items-start'>
                          <Label className='text-sm font-medium'>
                            Question {qIndex + 1}
                          </Label>
                          {quizQuestions.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => removeQuestion(qIndex)}
                            >
                              <X className='h-4 w-4 text-red-500' />
                            </Button>
                          )}
                        </div>

                        <Input
                          value={q.question}
                          onChange={e =>
                            updateQuestion(qIndex, 'question', e.target.value)
                          }
                          placeholder='Enter your question...'
                        />

                        <div className='space-y-2'>
                          <Label className='text-xs text-slate-500'>
                            Options (click to mark correct answer)
                          </Label>
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className='flex items-center gap-2'
                            >
                              <Button
                                type='button'
                                variant={
                                  q.correctOptionIndex === optIndex
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                className='w-8 h-8 p-0'
                                onClick={() =>
                                  updateQuestion(
                                    qIndex,
                                    'correctOptionIndex',
                                    optIndex
                                  )
                                }
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </Button>
                              <Input
                                value={opt}
                                onChange={e =>
                                  updateOption(qIndex, optIndex, e.target.value)
                                }
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                className={
                                  q.correctOptionIndex === optIndex
                                    ? 'border-green-500'
                                    : ''
                                }
                              />
                            </div>
                          ))}
                        </div>

                        <div className='space-y-1'>
                          <Label className='text-xs text-slate-500'>
                            Explanation (shown after answering)
                          </Label>
                          <Input
                            value={q.explanation || ''}
                            onChange={e =>
                              updateQuestion(
                                qIndex,
                                'explanation',
                                e.target.value
                              )
                            }
                            placeholder='Why is this the correct answer?'
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowAddLesson(false);
                setLessonType('VIDEO');
                setQuizQuestions([
                  {
                    question: '',
                    options: ['', '', '', ''],
                    correctOptionIndex: 0,
                    explanation: '',
                  },
                ]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLesson}
              disabled={
                !newLesson.title.trim() ||
                (lessonType === 'QUIZ' &&
                  !quizQuestions.some(q => q.question.trim()))
              }
            >
              Add {lessonType === 'QUIZ' ? 'Quiz' : 'Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
