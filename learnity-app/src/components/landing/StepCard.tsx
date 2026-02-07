import React from 'react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  number: string | number;
  title: string;
  description: string;
  variant?: 'blue' | 'purple' | 'emerald';
  className?: string;
}

export function StepCard({ 
  number, 
  title, 
  description, 
  variant = 'blue', 
  className 
}: StepCardProps) {
  
  const accentColors = {
    blue: 'text-[#2E5BFF] bg-[#2E5BFF]/10 ring-[#2E5BFF]/20',
    purple: 'text-[#8B5CF6] bg-[#8B5CF6]/10 ring-[#8B5CF6]/20',
    emerald: 'text-[#10B981] bg-[#10B981]/10 ring-[#10B981]/20',
  };

  return (
    <div className={cn(
      "group relative flex flex-col justify-between h-full p-8 rounded-[32px]",
      "bg-white ring-1 ring-slate-200 shadow-sm",
      "hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500",
      className
    )}>
      {/* 1. Large "Ghost" Number Background */}
      <span className="absolute top-4 right-8 select-none text-8xl font-black italic opacity-[0.03] tracking-tighter text-slate-950 transition-all duration-700 group-hover:opacity-[0.08] group-hover:scale-110">
        {number}
      </span>

      <div className="relative z-10">
        {/* 2. Interactive Number Pill */}
        <div className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black italic text-xl mb-8 ring-1 transition-transform group-hover:-rotate-6",
          accentColors[variant]
        )}>
          {number}
        </div>

        {/* 3. Typography Stack */}
        <h3 className="text-2xl font-[1000] italic uppercase tracking-tighter text-[#0A0A0B] mb-4 leading-none">
          {title}
        </h3>
        
        <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base max-w-[90%]">
          {description}
        </p>
      </div>

      {/* 4. Apple-style "Next Step" Indicator (Bottom) */}
      <div className="mt-8 flex items-center gap-2">
        <div className={cn(
          "h-1.5 w-8 rounded-full transition-all group-hover:w-12",
          variant === 'blue' ? 'bg-[#2E5BFF]' : variant === 'purple' ? 'bg-[#8B5CF6]' : 'bg-[#10B981]'
        )} />
        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
      </div>
      
      {/* Inner Gloss Overlay */}
      <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
    </div>
  );
}