import { CourseCatalogSection } from '@/app/courses/CourseCatalogSection';

interface StudentPublicCoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentPublicCoursesPage({
  searchParams,
}: StudentPublicCoursesPageProps) {
  return (
    <div className='flex flex-col'>
      <div className='mb-8 px-6 lg:px-10 pt-8'>
        <h1 className='text-3xl font-black text-slate-900 uppercase italic tracking-tighter'>
          Intelligence <span className='text-indigo-600'>Base</span>
        </h1>
        <p className='text-slate-500 text-sm font-medium'>
          Access and enroll in global learning modules.
        </p>
      </div>

      <CourseCatalogSection
        searchParams={searchParams}
        basePath='/dashboard/student/public-cources'
      />
    </div>
  );
}
