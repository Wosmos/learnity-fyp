'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
        'hidden lg:flex w-1/2 bg-[#020617] relative overflow-hidden flex-col justify-between p-16 text-white border-r border-white/5',
        className
      )}
    >
      {/* --- Animated Background Elements --- */}
      <div className="absolute inset-0 z-0">
        {/* Animated Blob 1 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]"
        />
        
        {/* Animated Blob 2 */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px]"
        />

        {/* Subtle Moving Grid */}
        <motion.div 
          initial={{ backgroundPosition: "0 0" }}
          animate={{ backgroundPosition: "40px 40px" }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* --- Content Layers --- */}
      
      {/* Header/Logo */}
      <Logo showText={true} />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-xl">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>Top-rated education platform</span>
          </div>
          
          <h1 className="text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500 italic uppercase">
            {title}
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed font-medium max-w-md">
            {subtitle}
          </p>

          {/* Social Proof / Trust Badges */}
          <div className="pt-8 flex flex-wrap gap-6 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
                    <Users className="w-4 h-4" />
                  </div>
                ))}
              </div>
               <div className="text-sm">
                <p className="font-bold text-white">Verified Mentors</p>
                <p className="text-slate-500 text-xs">Industry experts only</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Quote / Note */}
      <div className="relative z-10 pt-10">
        <p className="text-sm text-slate-500 font-medium">
          © 2026 Learnity Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LeftSideSection;