import Link from 'next/link';
import { Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../ui/logo';

interface LeftSideSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const LeftSideSection = ({
  title = 'Unlock your potential with expert-led learning.',
  subtitle = 'Experience a platform designed for modern education. Connect with world-class mentors in real-time.',
  className,
}: LeftSideSectionProps) => {
  return (
    <div
      className={cn(
        'hidden relative md:flex flex-col justify-between overflow-hidden bg-[#020617] p-8 md:p-12 lg:p-16 text-white border-b lg:border-b-0 lg:border-r border-white/5 w-full lg:w-1/2 min-h-[60vh] lg:h-screen lg:sticky lg:top-0',
        className
      )}
    >
      {/* --- CSS-Only Background Elements --- */}
      <div className='absolute inset-0 z-0 pointer-events-none'>
        {/* Animated Blob 1 - Pulse & Float */}
        <div className='absolute -top-20 -left-20 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-blue-600/10 blur-[80px] md:blur-[120px] animate-pulse' />

        {/* Animated Blob 2 - Subtle Glow */}
        <div className='absolute bottom-[-10%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] rounded-full bg-indigo-500/10 blur-[60px] md:blur-[100px] animate-bounce [animation-duration:10s]' />

        {/* Grainy Noise & Grid - Standard CSS */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]' />
      </div>

      {/* --- Content Layers --- */}
      <div className='relative z-10'>
        <Logo showText={true} />
      </div>

      <div className='relative z-10 max-w-xl my-12 lg:my-0'>
        <div className='space-y-6 md:space-y-8'>
          <div className='inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[6px] md:text-xs font-medium w-fit'>
            <Star className='w-3.5 h-3.5 md:w-4 h-4 fill-current' />
            <span>Top-rated education platform</span>
          </div>

          <h1 className='text-xl lg:text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500 italic uppercase'>
            {title}
          </h1>

          <p className='text-base md:text-md  text-slate-400 leading-relaxed font-medium max-w-md'>
            {subtitle}
          </p>

          {/* Social Proof */}
          <div className='pt-6 md:pt-8 flex flex-wrap gap-6 border-t border-white/5'>
            <div className='flex items-center space-x-3'>
              <div className='flex -space-x-3'>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center ring-1 ring-white/10'
                  >
                    <Users className='w-3 h-3 md:w-4 h-4' />
                  </div>
                ))}
              </div>
              <div className='text-sm'>
                <p className='font-bold text-white leading-tight'>
                  Verified Mentors
                </p>
                <p className='text-slate-500 text-[10px] md:text-xs'>
                  Industry experts only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className='relative z-10 pt-6'>
        <p className='text-[10px] md:text-xs lg:text-sm text-slate-600 font-medium'>
          © 2026 Learnity Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LeftSideSection;
