'use client';

import React from 'react';
import { CheckCircle2, GraduationCap, BookOpen, Users, ArrowUpRight } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  available: boolean;
}

const roleOptions: RoleOption[] = [
  {
    role: UserRole.STUDENT,
    title: 'I want to learn',
    description: 'Access elite modules, track progress, and grow your skills.',
    features: ['Modular Learning', 'Skill Tracking', 'Verified Creds'],
    icon: GraduationCap,
    available: true
  },
  {
    role: UserRole.TEACHER,
    title: 'I want to teach',
    description: 'Architect your influence, help students, and monetize expertise.',
    features: ['Scale Revenue', 'Global Reach', 'Impact Analytics'],
    icon: BookOpen,
    available: true
  }
];

export const RoleSelection = ({ onRoleSelect, className }: { onRoleSelect: (role: UserRole) => void; className?: string }) => {
  const { selectedRole, setSelectedRole, setRegistrationStep } = useAuthStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationStep('form');
    onRoleSelect(role);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto px-6 py-12", className)}>
      {/* 1. Onyx Header Section */}
      <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-6 duration-1000">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4">
          <Users className="h-5 w-5 text-slate-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
          Identify Role
        </h1>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.4em] max-w-xs mx-auto italic">
          Select role for registration
        </p>
      </div>

      {/* 2. Role Selection Grid */}
      <div className="grid grid-cols-1 gap-px bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        {roleOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.role;
          
          return (
            <div
              key={option.role}
              onClick={() => handleRoleSelect(option.role)}
              className={cn(
                "group relative p-8 md:p-10 transition-all duration-700 cursor-pointer overflow-hidden",
                "bg-[#050608] hover:bg-[#08090b]",
                isSelected && "bg-[#0a0c10]"
              )}
            >
              {/* Slaty Noise Overlay (Visible on Hover) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              
              {/* Ghost Background Icon */}
              <Icon 
                className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-0 group-hover:opacity-[0.04] transition-all duration-1000 rotate-12 group-hover:rotate-0" 
                strokeWidth={0.5}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                {/* Icon Container - Morphic Style */}
                <div className={cn(
                  "h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500",
                  isSelected 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 border-white/10 text-slate-400 group-hover:border-white/40 group-hover:text-white"
                )}>
                  <Icon className="h-8 w-8" strokeWidth={isSelected ? 2 : 1.5} />
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                        "text-2xl font-black uppercase italic tracking-tighter transition-colors",
                        isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                    )}>
                      {option.title}
                    </h3>
                    <div className={cn(
                        "p-2 rounded-full border transition-all duration-500",
                        isSelected ? "border-white/40 bg-white/10" : "border-transparent opacity-0 group-hover:opacity-100"
                    )}>
                        <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-[13px] font-medium leading-relaxed italic max-w-sm group-hover:text-slate-400 transition-colors">
                    {option.description}
                  </p>
                  
                  {/* Features Metadata */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                    {option.features.map((feature) => (
                      <span key={feature} className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-500 transition-colors">
                        <span className="w-3 h-px bg-white/10 mr-2 group-hover:bg-white/30" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection Border Indicator */}
              <div className={cn(
                "absolute top-0 left-0 w-1 h-full bg-white transition-all duration-700",
                isSelected ? "opacity-100" : "opacity-0"
              )} />
            </div>
          );
        })}
      </div>

      {/* 3. Footer Links */}
      <div className="mt-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
          Already registered?{' '}
          <Link href="/auth/login" className="hover:text-slate-300 underline underline-offset-8 decoration-white/20 hover:decoration-white transition-all">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;