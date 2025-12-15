import CourseCatalogPage from '@/app/courses/page'

export default function StudentPublicCoursesPage() {
  return (
    <CourseCatalogPage 
      basePath="/dashboard/student/public-cources" 
      skipUrlUpdate={true} 
    />
  )
}