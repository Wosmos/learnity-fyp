'use client';

import React from 'react';
import { CheckCircle2, GraduationCap, BookOpen, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  glowColor: string;
  available: boolean;
}

const roleOptions: RoleOption[] = [
  {
    role: UserRole.STUDENT,
    title: 'I want to learn',
    description: 'Find a tutor, join a study group, and grow your skills.',
    features: ['Easy tutor booking', 'Study with friends', 'Track your progress'],
    icon: GraduationCap,
    glowColor: 'group-hover:border-blue-500/50',
    available: true
  },
  {
    role: UserRole.TEACHER,
    title: 'I want to teach',
    description: 'Share what you know, help students, and earn money.',
    features: ['Set your own prices', 'Manage your schedule', 'Share your resources'],
    icon: BookOpen,
    glowColor: 'group-hover:border-emerald-500/50',
    available: true
  }
];

export const RoleSelection = ({ onRoleSelect }: { onRoleSelect: (role: UserRole) => void }) => {
  const { selectedRole, setSelectedRole, setRegistrationStep } = useAuthStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationStep('form');
    onRoleSelect(role);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* Header - Simplified Language */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
          <Users className="h-6 w-6 text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white mb-3">
          Join Learnity
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium max-w-sm mx-auto">
          How would you like to use our platform? Choose an option to start.
        </p>
      </div>

      {/* Role Tiles */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {roleOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.role;
          
          return (
            <div
              key={option.role}
              onClick={() => handleRoleSelect(option.role)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer",
                "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]",
                isSelected ? "border-blue-500 bg-blue-500/[0.05]" : "hover:border-white/20",
                `animate-in fade-in slide-in-from-bottom-8 duration-700`
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                {/* Icon Circle */}
                <div className={cn(
                  "h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors",
                  isSelected ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 group-hover:text-white"
                )}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">
                      {option.title}
                    </h3>
                    <ChevronRight className={cn(
                      "h-5 w-5 transition-transform",
                      isSelected ? "text-blue-500 translate-x-1" : "text-slate-600 group-hover:text-slate-400"
                    )} />
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {option.description}
                  </p>
                  
                  {/* Features - Visible on Tablet/Desktop, Hidden or simplified on tiny phones */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                    {option.features.map((feature) => (
                      <span key={feature} className="flex items-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <CheckCircle2 className="h-3 w-3 text-blue-500/70 mr-1.5" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-10 text-center animate-in fade-in duration-1000 delay-500">
        <p className="text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;