'use client';

/**
 * New Course Page
 * Simple form to create a new course, then redirect to edit page
 * Requirements: 1.1-1.10
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2, CheckCircle } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<
    'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  >('BEGINNER');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !categoryId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      const response = await authenticatedFetch('/api/courses', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          categoryId,
          difficulty,
          tags: [],
          isFree,
          price: isFree ? 0 : Number(price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create course');
      }

      const data = await response.json();
      const courseId = data.data?.id;

      toast({
        title: 'Course Created!',
        description: 'Now add sections and lessons to your course.',
      });

      // Redirect to edit page
      router.push(`/dashboard/teacher/courses/${courseId}/edit`);
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to create course',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-[1600px] mx-auto px-4'>
          <div className='flex items-center gap-4 py-4'>
            <Link href='/dashboard/teacher/courses'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back
              </Button>
            </Link>
            <div>
              <h1 className='text-lg font-bold text-slate-900'>
                Create New Course
              </h1>
              <p className='text-sm text-slate-500'>
                Start with the basics, add content later
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-[1600px] mx-auto px-4 py-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              Course Details
            </CardTitle>
            <CardDescription>
              Fill in the basic information to create your course. You can add
              sections and lessons after.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Course Title *</Label>
              <Input
                id='title'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='e.g., Introduction to Web Development'
              />
              <p className='text-xs text-slate-500'>
                Choose a clear, descriptive title (3-100 characters)
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Describe what students will learn in this course...'
                rows={4}
              />
              <p className='text-xs text-slate-500'>
                Explain what the course covers (10-2000 characters)
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a category' />
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

              <div className='space-y-2'>
                <Label htmlFor='difficulty'>Difficulty Level</Label>
                <Select
                  value={difficulty}
                  onValueChange={(
                    v: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
                  ) => setDifficulty(v)}
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
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100'>
              <div className='space-y-3'>
                <Label className='text-base font-bold text-slate-900'>
                  Pricing Strategy
                </Label>
                <div className='flex gap-3'>
                  <Button
                    type='button'
                    variant={isFree ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      setIsFree(true);
                      setPrice(0);
                    }}
                    className='flex-1 rounded-xl h-11 uppercase font-black text-[10px] tracking-widest'
                  >
                    Free Access
                  </Button>
                  <Button
                    type='button'
                    variant={!isFree ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setIsFree(false)}
                    className='flex-1 rounded-xl h-11 uppercase font-black text-[10px] tracking-widest'
                  >
                    Premium Access
                  </Button>
                </div>
              </div>

              {!isFree && (
                <div className='space-y-3 animate-in fade-in slide-in-from-top-2 duration-300'>
                  <Label
                    htmlFor='price'
                    className='text-base font-bold text-slate-900'
                  >
                    Course Fee (PKR)
                  </Label>
                  <div className='relative'>
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold'>
                      $
                    </span>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      min='0'
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className='pl-8 h-11 rounded-xl font-bold border-2 focus-visible:ring-indigo-500 transition-all'
                      placeholder='99.99'
                    />
                  </div>
                </div>
              )}

              {isFree && (
                <div className='flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300'>
                  <div className='h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600'>
                    <CheckCircle className='h-4 w-4' />
                  </div>
                  <p className='text-xs font-bold text-emerald-700'>
                    This course will be FREE. Anyone can enroll instantly.
                  </p>
                </div>
              )}
            </div>

            <div className='pt-4 flex justify-end gap-3'>
              <Link href='/dashboard/teacher/courses'>
                <Button variant='outline'>Cancel</Button>
              </Link>
              <Button
                onClick={handleCreate}
                disabled={
                  isCreating ||
                  !title.trim() ||
                  !description.trim() ||
                  !categoryId
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Course'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className='mt-6 bg-slate-50 border-blue-200'>
          <CardContent className='py-4'>
            <h3 className='font-medium text-blue-900 mb-2'>
              What happens next?
            </h3>
            <ol className='text-sm text-blue-800 space-y-1'>
              <li>
                1. After creating, you&apos;ll be taken to the course editor
              </li>
              <li>2. Add sections to organize your content (like chapters)</li>
              <li>3. Add video lessons to each section using YouTube links</li>
              <li>4. When ready, publish your course for students to enroll</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
