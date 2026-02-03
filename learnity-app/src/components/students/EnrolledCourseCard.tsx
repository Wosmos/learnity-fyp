import { Clock, Trophy, ArrowRight, MonitorPlay, Zap } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CourseEnrollment {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'UNENROLLED';
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    totalDuration: number;
    lessonCount: number;
    averageRating: number;
    reviewCount: number;
    teacher: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    category: {
      id: string;
      name: string;
    };
  };
}

interface EnrolledCourseCardProps {
  enrollment: CourseEnrollment;
  onContinue: (id: string) => void;
}

// Format duration from seconds to human readable
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
export function EnrolledCourseCard({
  enrollment,
  onContinue,
}: EnrolledCourseCardProps) {
  const { course, progress, status, lastAccessedAt } = enrollment;
  const isCompleted = status === 'COMPLETED';

  // Dynamic color selection based on progress or category
  const themeColor = isCompleted
    ? 'from-emerald-500 to-teal-600'
    : 'from-indigo-600 to-violet-700';
  const barColor = isCompleted ? 'bg-emerald-500' : 'bg-indigo-600';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className='relative group bg-white rounded-2xl border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300'
    >
      <div className='p-6 md:p-8'>
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Visual Thumbnail Block */}
          <div
            className={cn(
              'w-full md:w-36 h-36 rounded-2xl bg-linear-to-br flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden',
              themeColor
            )}
          >
            {course.thumbnailUrl ? (
              <>
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className='object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500'
                />
                <div className='absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all' />
              </>
            ) : (
              <div className='absolute inset-0 bg-white/5' />
            )}

            <MonitorPlay className='relative h-12 w-12 text-white/40 group-hover:text-white group-hover:scale-110 transition-all duration-500 z-10' />

            {isCompleted && (
              <div className='absolute top-2 right-2 bg-white/20 backdrop-blur-md p-1.5 rounded-lg z-20'>
                <Trophy className='h-4 w-4 text-white' />
              </div>
            )}
          </div>

          {/* Data & Actions Block */}
          <div className='flex-1 space-y-5'>
            <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <Badge className='bg-slate-900/5 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest'>
                    {course.category?.name || 'Uncategorized'}
                  </Badge>
                  {isCompleted && (
                    <Badge className='bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest'>
                      Achieved
                    </Badge>
                  )}
                </div>
                <h4 className='text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight'>
                  {course.title || 'Untitled Course'}
                </h4>
                <p className='text-sm font-bold text-slate-400 mt-1'>
                  with{' '}
                  <span className='text-slate-600'>
                    {course.teacher?.name || 'Unknown Teacher'}
                  </span>
                </p>
              </div>

              <div className='text-left md:text-right shrink-0'>
                <span className='text-4xl font-black text-slate-900 tracking-tighter italic'>
                  {progress}%
                </span>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  {isCompleted ? 'Completion' : 'Mastery Level'}
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className='space-y-5'>
              <div className='relative h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'circOut' }}
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]',
                    barColor
                  )}
                />
              </div>

              <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div className='flex items-center gap-6'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-3.5 w-3.5 text-slate-400' />
                    <span className='text-[10px] font-black text-slate-500 uppercase tracking-tight'>
                      {formatDuration(course.totalDuration)} Total
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Zap className='h-3.5 w-3.5 text-orange-500 fill-orange-500/20' />
                    <span className='text-[10px] font-black text-slate-500 uppercase tracking-tight'>
                      {course.lessonCount} Lessons
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => onContinue(course.id)}
                  className={cn(
                    'w-full sm:w-auto rounded-xl px-10 h-12 font-black text-[11px] uppercase tracking-widest transition-all',
                    isCompleted
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] hover:shadow-indigo-200 active:scale-95'
                  )}
                >
                  <span className='flex items-center gap-2'>
                    {isCompleted ? 'Review Syllabus' : 'resume course'}
                    {!isCompleted && (
                      <ArrowRight className='h-3 w-3 group-hover:translate-x-1 transition-transform' />
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
