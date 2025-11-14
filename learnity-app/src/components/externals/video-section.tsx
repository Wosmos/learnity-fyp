/**
 * Video Section Component
 * Modern video showcase with features
 * Apple-inspired design
 */

'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { SectionHeader } from './section-header';
import { cn } from '@/lib/utils';

export interface VideoFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  bgColor?: string;
  iconColor?: string;
}

export interface VideoSectionProps {
  title: string;
  description?: string;
  videoUrl?: string;
  videoId?: string; // YouTube video ID
  placeholder?: React.ReactNode;
  features?: VideoFeature[];
  className?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
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
}: VideoSectionProps) {
  const videoSrc = videoId 
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    : videoUrl;

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-4">
        <div className={cn(maxWidthClasses[maxWidth], 'mx-auto')}>
          <SectionHeader
            title={title}
            description={description}
            maxWidth="2xl"
          />

          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 group">
            <div className="relative aspect-video">
              {videoSrc ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoSrc}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                placeholder || (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-all cursor-pointer group-hover:scale-110">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <p className="text-xl font-semibold">Watch Demo Video</p>
                      <p className="text-sm text-blue-100 mt-2">2 minutes overview</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Video Features */}
          {features && features.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const bgColor = feature.bgColor || 'bg-blue-100';
                const iconColor = feature.iconColor || 'text-blue-600';
                
                return (
                  <div key={index} className="text-center group">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110',
                      bgColor
                    )}>
                      <Icon className={cn('h-6 w-6', iconColor)} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
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

