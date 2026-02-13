'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Target,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export default function HighLights() {
  const achievements = [
    {
      title: 'Math Master',
      progress: 100,
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Goal Crusher',
      progress: 65,
      icon: Target,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    // { title: "Team Nexus", progress: 40, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <section className='space-y-6'>
      {/* 3x1 Tiles Grid */}
      <div className='grid grid-cols-2 gap-4'>
        {achievements.map((ach, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
              'relative group p-5 rounded-2xl bg-white border transition-all duration-300',
              'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-indigo-200',
              ach.progress === 100
                ? 'border-amber-100 shadow-sm'
                : 'border-slate-100'
            )}
          >
            {/* Status Indicator */}
            <div className='absolute top-4 right-4'>
              {ach.progress === 100 ? (
                <ShieldCheck className='h-4 w-4 text-emerald-500 fill-emerald-50' />
              ) : (
                <div className='h-1.5 w-1.5 rounded-full bg-slate-200' />
              )}
            </div>

            <div className='flex flex-col items-left text-left space-y-4'>
              {/* Icon Orb */}
              <div
                className={cn(
                  'h-8 w-8 rounded-2xl flex items-center justify-center relative transition-transform group-hover:rotate-[10deg]',
                  ach.bg
                )}
              >
                <ach.icon className={cn('h-4 w-4', ach.color)} />
                {ach.progress === 100 && (
                  <div className='absolute -inset-1 border border-amber-500/20 rounded-2xl animate-ping opacity-20' />
                )}
              </div>

              {/* Text Content */}
              <div className='flex justify-between items-center text-left'>
                <h4 className='font-black text-slate-900 text-xs uppercase tracking-tight leading-tight'>
                  {ach.title}
                </h4>
                <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                  LVL {Math.floor(ach.progress / 20)}
                </p>
              </div>

              {/* Radial-style Progress Info */}
              <div className='w-full space-y-2'>
                <div className='flex justify-between items-center text-[9px] font-black px-1'>
                  <span className='text-slate-400 uppercase'>Mastery</span>
                  <span
                    className={cn(
                      ach.progress === 100
                        ? 'text-emerald-600'
                        : 'text-indigo-600'
                    )}
                  >
                    {ach.progress}%
                  </span>
                </div>
                <div className='h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ach.progress}%` }}
                    transition={{ duration: 1, ease: 'circOut' }}
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      ach.progress === 100
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
