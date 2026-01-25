import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PublicLayout } from '@/components/layout/AppLayout';
import { Hero, CTA } from '@/components/externals';
import { CourseCatalogSection } from './CourseCatalogSection';

/**
 * Course Catalog Page - Public View
 */

interface PageProps {
  params: Promise<any>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sParams = await searchParams;
  const search = typeof sParams.search === 'string' ? sParams.search : '';
  const categoryId =
    typeof sParams.categoryId === 'string' ? sParams.categoryId : '';

  let title = 'Explore Professional Courses';
  const description =
    'Unlock your potential with expert-led courses on Learnity.';

  if (search) {
    title = `Searching for "${search}"`;
  } else if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });
    if (category) title = `${category.name} Specialized Courses`;
  }

  return {
    title: `${title} | Learnity`,
    description,
  };
}

export default async function CourseCatalogPage({ searchParams }: PageProps) {
  return (
    <PublicLayout showNavigation={true} className='bg-white'>
      <Hero
        badge={{ text: 'New Courses Added', showPulse: true }}
        title={
          <>
            <span className='block text-gray-900 mb-2'>Learn something</span>
            <span className='block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
              Amazing Today
            </span>
          </>
        }
        description='Choose from hundreds of courses taught by expert teachers. Start your learning journey today with personalized paths designed for you.'
        primaryAction={{
          label: 'View All Courses',
          href: '#course-grid',
          variant: 'cta',
        }}
      />

      <div id='course-grid' className='scroll-mt-20'>
        <CourseCatalogSection searchParams={searchParams} basePath='/courses' />
      </div>

      <CTA
        title='Ready to start your journey?'
        description='Join over 10,000 students who are already learning and growing on Learnity.'
        primaryAction={{
          label: 'Get Started Now',
          href: '/auth/register',
          variant: 'ctaSecondary',
        }}
        secondaryAction={{
          label: 'Become a Teacher',
          href: '/auth/register/teacher',
          variant: 'outline',
        }}
      />
    </PublicLayout>
  );
}
