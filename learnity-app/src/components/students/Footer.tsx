import { Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

const Footer = () => {
  return (
    <div>
      {' '}
      {/* 3. AI FOCUS SUGGESTION - REFINED ELEGANCE */}
      <div className='relative p-8 rounded-2xl bg-[#0F172A] overflow-hidden group'>
        <div className='absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity'>
          <Sparkles className='h-16 w-16 text-indigo-400' />
        </div>
        {/* Decorative Pattern */}
        <div
          className='absolute inset-0 opacity-[0.03] pointer-events-none'
          style={{
            backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className='relative z-10 flex flex-col md:flex-row md:items-center gap-8'>
          <div className='h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0'>
            <Zap className='h-7 w-7 text-indigo-400 fill-indigo-400' />
          </div>
          <div className='space-y-1 flex-1'>
            <h4 className='font-black text-xl text-white tracking-tight'>
              Intelligence Optimization
            </h4>
            <p className='text-slate-400 text-sm font-medium leading-relaxed'>
              Based on quiz patterns, accelerating{' '}
              <span className='text-indigo-400 font-bold'>Chapter 6</span> now
              will optimize your mastery score by{' '}
              <span className='text-emerald-400'>+15%</span>.
            </p>
          </div>
          <Button className='bg-white text-slate-900 hover:bg-indigo-50 rounded-xl px-10 h-12 font-black uppercase text-[10px] tracking-widest transition-all'>
            Execute Learning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
