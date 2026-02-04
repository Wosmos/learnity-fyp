'use client';

import React from 'react';
import { GraduationCap, BookOpen, ArrowUpRight, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const roles = [
  {
    title: 'I want to learn',
    description: 'Access elite modules, track progress, and grow your skills.',
    icon: GraduationCap,
    href: '/auth/register/student',
  },
  {
    title: 'I want to teach',
    description: 'Architect your influence, help students, and monetize expertise.',
    icon: BookOpen,
    href: '/auth/register/teacher',
  },
];

export const RoleSelection = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      {/* 1. Onyx Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4">
          <Users className="h-5 w-5 text-slate-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-slate-950">
          Choose Role
        </h1>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.4em] max-w-xs mx-auto italic">
          Select role for registration
        </p>
      </div>

      {/* 2. Simplified Redirect Grid */}
      <div className="grid grid-cols-1 gap-px bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        {roles.map((role) => {
          const Icon = role.icon;

          return (
            <Link
              key={role.href}
              href={role.href}
              className={cn(
                'group relative p-8 md:p-10 transition-all duration-700 overflow-hidden',
                'bg-[#050608] hover:bg-[#08090b]'
              )}
            >
              {/* Slaty Noise Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                {/* Icon Container */}
                <div className="h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 text-slate-400 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-500">
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-300 group-hover:text-white transition-colors">
                      {role.title}
                    </h3>
                    <div className="p-2 rounded-full border border-transparent opacity-0 group-hover:opacity-100 group-hover:border-white/40 group-hover:bg-white/10 transition-all duration-500">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <p className="text-slate-500 text-[13px] font-medium leading-relaxed italic max-w-sm group-hover:text-slate-400 transition-colors">
                    {role.description}
                  </p>
                </div>
              </div>

              {/* Hover Indicator */}
              <div className="absolute top-0 left-0 w-1 h-0 bg-white transition-all duration-500 group-hover:h-full" />
            </Link>
          );
        })}
      </div>

      {/* 3. Footer */}
      <div className="mt-12 text-center">
        <Link
          href="/auth/login"
          className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-slate-300 underline underline-offset-8 decoration-white/20 hover:decoration-white transition-all"
        >
          Already registered? Login
        </Link>
      </div>
    </div>
  );
};

export default RoleSelection;