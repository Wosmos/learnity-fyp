import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Star,
  Users,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface LeftSideSectionProps {
  title?: string;
  subtitle?: string;
  statCount?: string;
  statLabel?: string;
  testimonial?: Testimonial;
  className?: string;
}

const LeftSideSection = ({
  title = 'Unlock your potential with expert-led learning.',
  subtitle = 'Experience a platform designed for modern education.',
  className,
}: LeftSideSectionProps) => {
  return (
    <div
      className={cn(
        'hidden lg:flex w-1/2 bg-[#020617] relative overflow-hidden flex-col justify-between p-16 text-white border-r border-white/5',
        className
      )}
    >
      {/* Onyx Morphic Background */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]' />
        <div className='absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]' />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      </div>

      {/* Header/Logo */}
      <div className='relative z-10 animate-in fade-in slide-in-from-top-4 duration-700'>
        <Link href='/' className='flex items-center space-x-3 w-fit group'>
          <div className='p-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl group-hover:bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-white/20'>
            <img src='/logo.svg' alt='Learnity' className='h-6 w-6' />
          </div>
          <span className='text-xl font-bold tracking-tighter text-white'>
            Learnity
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className='relative z-10 max-w-lg space-y-10'>
        <div className='space-y-6'>
          <div className='animate-in fade-in slide-in-from-left-6 duration-1000 delay-150'>
            <h1 className='text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white italic uppercase font-black'>
              {title}
            </h1>
          </div>

          <p className='text-lg text-slate-400 leading-relaxed font-medium animate-in fade-in slide-in-from-left-8 duration-1000 delay-300'>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeftSideSection;
