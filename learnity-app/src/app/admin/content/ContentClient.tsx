'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, FolderOpen, Star, Eye, EyeOff, Trash2,
  Archive, Globe, Users, MessageSquare,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  isFree: boolean;
  price: number | null;
  averageRating: number;
  isFeatured: boolean;
  createdAt: string;
  publishedAt: string | null;
  teacher: { id: string; name: string };
  category: { id: string; name: string } | null;
  counts: { enrollments: number; reviews: number; lessons: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  courseCount: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: { id: string; name: string };
  course: { id: string; title: string };
}

interface Props {
  courses: Course[];
  categories: Category[];
  reviews: Review[];
  courseStats: { published: number; draft: number; archived: number; total: number };
}

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-slate-100 text-slate-600',
};

export function ContentClient({ courses, categories, reviews, courseStats }: Props) {
  const [search, setSearch] = useState('');
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Content</h1>
        <p className='text-muted-foreground'>Manage courses, categories, and moderate reviews.</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          { label: 'Published', value: courseStats.published, color: 'text-green-600 bg-green-50', icon: Globe },
          { label: 'Draft', value: courseStats.draft, color: 'text-amber-600 bg-amber-50', icon: BookOpen },
          { label: 'Archived', value: courseStats.archived, color: 'text-slate-600 bg-slate-50', icon: Archive },
          { label: 'Total Courses', value: courseStats.total, color: 'text-blue-600 bg-blue-50', icon: FolderOpen },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold'>{s.value}</p>
                  <p className='text-sm text-muted-foreground'>{s.label}</p>
                </div>
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <s.icon className='h-5 w-5' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue='courses'>
        <TabsList className='h-11'>
          <TabsTrigger value='courses' className='gap-2'>
            <BookOpen className='h-4 w-4' />Courses
            <Badge variant='secondary'>{courseStats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value='categories' className='gap-2'>
            <FolderOpen className='h-4 w-4' />Categories
            <Badge variant='secondary'>{categories.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value='reviews' className='gap-2'>
            <MessageSquare className='h-4 w-4' />Reviews
            <Badge variant='secondary'>{reviews.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value='courses' className='mt-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>All Courses</CardTitle>
                  <CardDescription>View and manage all platform courses</CardDescription>
                </div>
                <Input
                  placeholder='Search courses or teachers...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className='w-64'
                />
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='pl-6'>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className='text-center'>Students</TableHead>
                    <TableHead className='text-center'>Lessons</TableHead>
                    <TableHead className='text-center'>Rating</TableHead>
                    <TableHead className='text-right pr-6'>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => (
                    <TableRow key={course.id} className='hover:bg-muted/50'>
                      <TableCell className='pl-6 font-medium max-w-[250px] truncate'>
                        {course.title}
                        {course.isFeatured && (
                          <Badge className='ml-2 bg-amber-100 text-amber-700 text-[10px]'>Featured</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{course.teacher.name}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[course.status] || ''} border-0`}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{course.category?.name || '—'}</TableCell>
                      <TableCell className='text-center'>
                        <span className='flex items-center justify-center gap-1 text-sm'>
                          <Users className='h-3 w-3' />{course.counts.enrollments}
                        </span>
                      </TableCell>
                      <TableCell className='text-center text-sm'>{course.counts.lessons}</TableCell>
                      <TableCell className='text-center'>
                        <span className='flex items-center justify-center gap-1 text-sm'>
                          <Star className='h-3 w-3 text-amber-500' />{course.averageRating.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className='text-right pr-6 font-medium'>
                        {course.isFree ? <span className='text-green-600'>Free</span> : `Rs. ${course.price}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value='categories' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage course categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {categories.map(cat => (
                  <div key={cat.id} className='p-4 border rounded-xl hover:border-primary/30 transition-colors'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-semibold text-foreground'>{cat.name}</h3>
                      <Badge variant='secondary'>{cat.courseCount} courses</Badge>
                    </div>
                    {cat.description && (
                      <p className='text-sm text-muted-foreground line-clamp-2'>{cat.description}</p>
                    )}
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className='text-muted-foreground col-span-full text-center py-8'>No categories yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value='reviews' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Moderate course reviews</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='pl-6'>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className='max-w-[300px]'>Comment</TableHead>
                    <TableHead className='text-right pr-6'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell className='pl-6 font-medium'>{review.student.name}</TableCell>
                      <TableCell className='text-muted-foreground max-w-[200px] truncate'>{review.course.title}</TableCell>
                      <TableCell>
                        <span className='flex items-center gap-1'>
                          <Star className='h-3 w-3 text-amber-500' />{review.rating}
                        </span>
                      </TableCell>
                      <TableCell className='max-w-[300px] truncate text-muted-foreground'>
                        {review.comment || <span className='italic'>No comment</span>}
                      </TableCell>
                      <TableCell className='text-right pr-6 text-sm text-muted-foreground'>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
