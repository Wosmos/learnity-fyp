'use client';

/**
 * New Course Page
 * Simple form to create a new course, then redirect to edit page
 * Requirements: 1.1-1.10
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { ClientTeacherProtection } from '@/components/auth/ClientTeacherProtection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
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
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in data
        const categoriesArray = Array.isArray(data) ? data : (data.data || []);
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
          isFree: true,
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
        description: err instanceof Error ? err.message : 'Failed to create course',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading) {
    return (
      <ClientTeacherProtection>
        <AuthenticatedLayout>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </AuthenticatedLayout>
      </ClientTeacherProtection>
    );
  }

  return (
    <ClientTeacherProtection>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-slate-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-4 py-4">
                <Link href="/dashboard/teacher/courses">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Create New Course</h1>
                  <p className="text-sm text-slate-500">Start with the basics, add content later</p>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Details
                </CardTitle>
                <CardDescription>
                  Fill in the basic information to create your course. You can add sections and lessons after.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Introduction to Web Development"
                  />
                  <p className="text-xs text-slate-500">Choose a clear, descriptive title (3-100 characters)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn in this course..."
                    rows={4}
                  />
                  <p className="text-xs text-slate-500">Explain what the course covers (10-2000 characters)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select 
                      value={difficulty} 
                      onValueChange={(v: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => setDifficulty(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Link href="/dashboard/teacher/courses">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button 
                    onClick={handleCreate} 
                    disabled={isCreating || !title.trim() || !description.trim() || !categoryId}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. After creating, you&apos;ll be taken to the course editor</li>
                  <li>2. Add sections to organize your content (like chapters)</li>
                  <li>3. Add video lessons to each section using YouTube links</li>
                  <li>4. When ready, publish your course for students to enroll</li>
                </ol>
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthenticatedLayout>
    </ClientTeacherProtection>
  );
}
