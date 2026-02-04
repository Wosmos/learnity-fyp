/**
 * VideoSection Component - Onyx Morphic Edition
 * Features: Hairline glass architecture, slaty textures, and technical metadata.
 */

import React from 'react';
import { LucideIcon, Play, Monitor, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

export interface VideoFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string; // Added for the Onyx metadata look
}

export interface VideoSectionProps {
  title: string;
  description?: string;
  videoUrl?: string;
  videoId?: string;
  placeholder?: React.ReactNode;
  features?: VideoFeature[];
  className?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
  highlightWord: string;
}

const maxWidthClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export function VideoSection({
  title,
  description,
  videoUrl,
  videoId,
  placeholder,
  features,
  className,
  maxWidth = '5xl',
  highlightWord,
}: VideoSectionProps) {
  const videoSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    : videoUrl;

  return (
    <section
      className={cn('py-10 bg-white relative overflow-hidden', className)}
    >
      {/* Background Slaty Texture (Subtle) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className='container mx-auto px-4 relative z-10'>
        <div className={cn(maxWidthClasses[maxWidth], 'mx-auto')}>
          <SectionHeader
            title={title}
            highlightWord={highlightWord}
            description={description}
            maxWidth='2xl'
            className='mb-16'
          />

          {/* 1. The Video "Registry" Card */}
          <div className='relative group'>
            {/* Architectural Frame Decoration */}
            <div className='absolute -inset-4 border border-slate-100 rounded-[2.5rem] pointer-events-none transition-all duration-700 group-hover:border-slate-200 group-hover:scale-[1.01]' />

            <div className='relative rounded-[2rem] overflow-hidden bg-[#050608] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/[0.08]'>
              <div className='relative aspect-video'>
                {videoSrc ? (
                  <iframe
                    className='absolute inset-0 w-full h-full opacity-90 transition-opacity group-hover:opacity-100'
                    src={videoSrc}
                    title={title}
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    allowFullScreen
                  />
                ) : (
                  placeholder || (
                    <div className='absolute inset-0 flex items-center justify-center bg-[#0a0c10]'>
                      {/* Slaty Noise Overlay inside Player */}
                      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                      <div className='relative text-center'>
                        <div className='w-24 h-24 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] cursor-pointer'>
                          <Play className='w-8 h-8 text-white fill-current translate-x-1' />
                        </div>
                        <h4 className='text-xl font-black uppercase italic tracking-tighter text-white'>
                          Initialize Briefing
                        </h4>
                        <p className='text-[10px] text-slate-500 uppercase tracking-[0.4em] mt-2 font-bold'>
                          Duration: 02:40 / 4K_UHD
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* 2. Tactical Feature Grid */}
          {features && features.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-0 mt-20 border-t border-slate-100'>
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className='p-10 border-b border-r border-slate-100 transition-all duration-500 hover:bg-slate-50 group'
                  >
                    <div className='flex flex-col gap-6'>
                      <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 text-white transition-transform group-hover:scale-110 group-hover:-rotate-6'>
                        <Icon className='h-5 w-5' />
                      </div>

                      <div>
                        <span className='text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-2 italic'>
                          {feature.tag || `Module_0${index + 1}`}
                        </span>
                        <h3 className='font-black text-xl uppercase italic tracking-tighter text-slate-900 mb-3 leading-none'>
                          {feature.title}
                        </h3>
                        <p className='text-sm font-medium text-slate-500 leading-relaxed italic'>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
