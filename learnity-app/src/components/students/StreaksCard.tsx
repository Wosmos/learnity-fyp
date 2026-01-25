'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EliteStreakCard() {
  // Desktop: 35 days (5 weeks)
  const desktopActivity = Array.from({ length: 35 }, (_, i) => ({
    active: i > 28,
    level: i > 28 ? 4 : Math.floor(Math.random() * 3),
  }));

  // Mobile: Last 7 days only
  const mobileActivity = desktopActivity.slice(-7);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='relative overflow-hidden w-full bg-slate-950 rounded-2xl shadow-2xl border border-white/5 group active:scale-[0.98] transition-all duration-200'
    >
      {/* Background Glow */}
      <div className='absolute -top-10 -right-10 h-32 w-32 bg-orange-500/10 blur-[50px] pointer-events-none' />

      {/* ==================== MOBILE VIEW (Minimal Strip) ==================== */}
      <div className='block md:hidden p-4'>
        <div className='flex items-center justify-between'>
          {/* Left: Score & Icon */}
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='absolute inset-0 bg-orange-500 blur-lg opacity-20 animate-pulse'></div>
              <div className='relative bg-slate-900/50 p-2.5 rounded-xl border border-white/10 shadow-inner'>
                <Flame className='h-5 w-5 text-orange-500 fill-orange-500' />
              </div>
            </div>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-2xl font-black text-white tracking-tighter'>
                  7
                </span>
                <span className='text-[10px] font-bold text-orange-500 uppercase tracking-widest'>
                  Days
                </span>
              </div>
              <p className='text-[10px] text-slate-500 font-medium -mt-1'>
                Top 5% Consistency
              </p>
            </div>
          </div>

          {/* Right: 7-Day Micro Heatmap */}
          <div className='flex gap-[3px] items-end h-full'>
            {mobileActivity.map((day, i) => (
              <div key={i} className='flex flex-col items-center gap-1'>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'w-[8px] rounded-[2px] transition-all duration-300',
                    // Dynamic height for visual interest on mobile
                    i === 6
                      ? 'h-6 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                      : 'h-4',
                    getLevelColor(day.level)
                  )}
                />
                <span className='text-[8px] font-bold text-slate-700 uppercase'>
                  {days[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== DESKTOP VIEW (Full Matrix) ==================== */}
      <div className='hidden md:block p-5 h-full'>
        <div className='flex flex-col gap-5 h-full'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='relative flex items-center justify-center'>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className='absolute inset-0 bg-orange-500 rounded-full blur-md'
                />
                <div className='relative bg-slate-900 p-2 rounded-xl border border-white/10'>
                  <Flame className='h-4 w-4 text-orange-500 fill-orange-500' />
                </div>
              </div>
              <div>
                <h3 className='text-sm font-black text-white leading-none tracking-tight'>
                  Focus Momentum
                </h3>
                <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1'>
                  Status: Elite
                </p>
              </div>
            </div>

            <div className='text-right'>
              <div className='flex items-baseline justify-end gap-1'>
                <span className='text-3xl font-black text-white tracking-tighter'>
                  7
                </span>
                <span className='text-[10px] font-black text-orange-500 uppercase tracking-widest'>
                  Day Streak
                </span>
              </div>
            </div>
          </div>

          {/* Matrix */}
          <div className='space-y-2'>
            <div className='flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-slate-600'>
              <span>Recent Activity</span>
              <div className='flex gap-1 items-center'>
                <span>Less</span>
                {[0, 1, 2, 3, 4].map(lvl => (
                  <div
                    key={lvl}
                    className={cn(
                      'h-1.5 w-1.5 rounded-[1px]',
                      getLevelColor(lvl)
                    )}
                  />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className='flex gap-[3px] flex-1'>
              {/* Days Label */}
              <div className='grid grid-rows-7 gap-[3px] text-[8px] font-black text-slate-700 uppercase leading-[10px] pt-[2px]'>
                <span className='h-[10px]'>Mon</span>
                <span className='h-[10px]' />
                <span className='h-[10px]'>Wed</span>
                <span className='h-[10px]' />
                <span className='h-[10px]'>Fri</span>
                <span className='h-[10px]' />
                <span className='h-[10px]' />
              </div>

              {/* The Grid */}
              {Array.from({ length: 5 }).map((_, weekIndex) => (
                <div key={weekIndex} className='grid grid-rows-7 gap-[3px]'>
                  {desktopActivity
                    .slice(weekIndex * 7, (weekIndex + 1) * 7)
                    .map((day, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.5, zIndex: 20 }}
                        className={cn(
                          'h-[10px] w-[10px] rounded-[2px] transition-colors duration-300',
                          getLevelColor(day.level)
                        )}
                      />
                    ))}
                </div>
              ))}

              {/* Side Stats */}
              <div className='ml-4 self-center space-y-3 flex-1'>
                <div>
                  <div className='flex justify-between items-end mb-1.5'>
                    <span className='text-[9px] font-bold text-slate-500 uppercase'>
                      Next Goal
                    </span>
                    <span className='text-[9px] font-bold text-white'>
                      10 Days
                    </span>
                  </div>
                  <div className='h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      className='h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400'>
                    <Zap className='h-3 w-3 text-orange-500 fill-orange-500' />
                    <span>94% Consistency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getLevelColor(level: number) {
  switch (level) {
    case 0:
      return 'bg-slate-800/50';
    case 1:
      return 'bg-orange-900/40';
    case 2:
      return 'bg-orange-700/60';
    case 3:
      return 'bg-orange-600';
    case 4:
      return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
    default:
      return 'bg-slate-800/50';
  }
}
