'use client'
import React from 'react';
import Link from 'next/link';
import { Home, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SimpleTVNotFound() {
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-6 text-white">
      
      {/* 1. THE TV - Pure CSS Glitch (No State Needed) */}
      <div className="relative w-full max-w-md aspect-video mb-12">
        {/* Hardware Frame */}
        <div className="absolute inset-0 bg-[#1A1A1E] rounded-[32px] border-[10px] border-[#27272A] shadow-2xl overflow-hidden ring-1 ring-white/10">
          
          {/* THE SCREEN - Permanent CSS Glitch */}
          <div className="absolute inset-3 rounded-[20px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center">
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20 bg-[size:100%_3px,3px_100%]" />

            {/* Content with CSS Animation */}
            <div className="relative z-10 text-center animate-[glitch_3s_infinite]">
              <h1 className="text-7xl md:text-8xl font-[1000] italic tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                404
              </h1>
              <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">
                No Signal
              </p>
            </div>

            {/* Subtle Static Flicker */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://media.giphy.com/media/oEI9uWUqnW3Fe/giphy.gif')] bg-cover mix-blend-overlay" />
          </div>
        </div>

        {/* Small Hardware Detail */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-16 bg-[#27272A] rounded-full" />
      </div>

      {/* 2. SIMPLE NAVIGATION */}
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <div className="text-center">
          <h2 className="text-xl font-bold uppercase tracking-tight">Lost in transmission</h2>
          <p className="text-slate-500 text-sm">The module you requested is not found.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            <Home size={18} /> Home
          </Link>
          <Link 
            href="/courses" 
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#1A1A1E] border border-white/10 text-white font-bold text-sm hover:bg-[#27272A] transition-colors"
          >
            <BookOpen size={18} /> Courses
          </Link>
        </div>
      </div>

      {/* 3. GLOBAL KEYFRAMES */}
      <style jsx global>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          2% { transform: translate(-2px, 2px) skewX(5deg); }
          4% { transform: translate(2px, -2px) skewX(-5deg); }
          6% { transform: translate(0); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  );
}