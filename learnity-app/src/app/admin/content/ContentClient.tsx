'use client';

import { useState } from 'react';
import {
  BookOpen, FolderOpen, Star,
  Archive, Globe, Users, MessageSquare,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/stats-card';
import { DataGrid, type ColumnDef } from '@/components/ui/data-grid';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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

const courseColumns: ColumnDef<Course>[] = [
  {
    key: 'title', header: 'Course', maxWidth: 'max-w-[250px]',
    render: (c) => (
      <span className='font-medium'>
        {c.title}
        {c.isFeatured && <Badge className='ml-2 bg-amber-100 text-amber-700 text-[10px]'>Featured</Badge>}
      </span>
    ),
  },
  { key: 'teacher', header: 'Teacher', className: 'text-muted-foreground', render: (c) => c.teacher.name },
  {
    key: 'status', header: 'Status',
    render: (c) => <Badge className={`${statusColors[c.status] || ''} border-0`}>{c.status}</Badge>,
  },
  { key: 'category', header: 'Category', className: 'text-muted-foreground', render: (c) => c.category?.name || '—' },
  {
    key: 'students', header: 'Students', align: 'center',
    render: (c) => <span className='flex items-center justify-center gap-1 text-sm'><Users className='h-3 w-3' />{c.counts.enrollments}</span>,
  },
  { key: 'lessons', header: 'Lessons', align: 'center', render: (c) => c.counts.lessons },
  {
    key: 'rating', header: 'Rating', align: 'center',
    render: (c) => <span className='flex items-center justify-center gap-1 text-sm'><Star className='h-3 w-3 text-amber-500' />{c.averageRating.toFixed(1)}</span>,
  },
  {
    key: 'price', header: 'Price', align: 'right', className: 'font-medium',
    render: (c) => c.isFree ? <span className='text-green-600'>Free</span> : `Rs. ${c.price}`,
  },
];

const reviewColumns: ColumnDef<Review>[] = [
  { key: 'student', header: 'Student', className: 'font-medium', render: (r) => r.student.name },
  { key: 'course', header: 'Course', className: 'text-muted-foreground', maxWidth: 'max-w-[200px]', render: (r) => r.course.title },
  {
    key: 'rating', header: 'Rating',
    render: (r) => <span className='flex items-center gap-1'><Star className='h-3 w-3 text-amber-500' />{r.rating}</span>,
  },
  {
    key: 'comment', header: 'Comment', maxWidth: 'max-w-[300px]', className: 'text-muted-foreground',
    render: (r) => r.comment || <span className='italic'>No comment</span>,
  },
  {
    key: 'date', header: 'Date', align: 'right', className: 'text-sm text-muted-foreground',
    render: (r) => new Date(r.createdAt).toLocaleDateString(),
  },
];

export function ContentClient({ courses, categories, reviews, courseStats }: Props) {
  const [search, setSearch] = useState('');

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
        <MetricCard title='Published' value={courseStats.published} icon={Globe} subtitle='Live courses' />
        <MetricCard title='Draft' value={courseStats.draft} icon={BookOpen} subtitle='Unpublished' />
        <MetricCard title='Archived' value={courseStats.archived} icon={Archive} subtitle='Hidden' />
        <MetricCard title='Total Courses' value={courseStats.total} icon={FolderOpen} subtitle='All courses' />
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
                <Input placeholder='Search courses or teachers...' value={search} onChange={e => setSearch(e.target.value)} className='w-64' />
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <DataGrid columns={courseColumns} data={filteredCourses} emptyMessage='No courses found.' pageSize={20} />
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
              <DataGrid columns={reviewColumns} data={reviews} emptyMessage='No reviews yet.' pageSize={20} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
