'use client';

import React, { useState } from 'react';
import { Mail, Clock, RefreshCw, ArrowLeft, ChevronRight, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';

export interface EmailVerificationPendingProps {
  userRole: UserRole | null;
  onResendVerification: () => Promise<void>;
  onBackToLogin: () => void;
  className?: string;
}

export const EmailVerificationPending: React.FC<EmailVerificationPendingProps> = ({
  userRole,
  onResendVerification,
  onBackToLogin,
  className = '',
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await onResendVerification();
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsResending(false);
    }
  };

  const getRoleContent = () => {
    switch (userRole) {
      case UserRole.TEACHER:
        return {
          title: 'Review Initiated',
          description: 'Thank you for applying to teach. Verify your email to begin the credential audit.',
          steps: [
            'Check inbox for verification link',
            'Click link to verify email identity',
            'Await application review (2-3 days)',
            'Receive status notification'
          ],
          accent: 'text-emerald-500'
        };
      default:
        return {
          title: 'Account Created',
          description: 'Welcome to Learnity! Please verify your email to unlock your student dashboard.',
          steps: [
            'Check inbox for verification link',
            'Click link to activate account',
            'Complete student profile setup',
            'Start exploring elite modules'
          ],
          accent: 'text-blue-600'
        };
    }
  };

  const content = getRoleContent();

  return (
    <div className={cn('w-full max-w-[580px] mx-auto py-12 px-6', className)}>
      {/* 1. Onyx Header Area */}
      <div className="text-center mb-10 space-y-3">

        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black leading-none">
          {content.title}<span className={content.accent}>!</span>
        </h1>
        <p className="text-slate-500 font-medium italic text-sm max-w-sm mx-auto">
          {content.description}
        </p>
      </div>

      {/* 2. Main Structural Card */}
      <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">

        {/* Verification Status Banner */}
        <div className="bg-black text-white p-5 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verification Pending</span>
          </div>
          <Clock className="h-4 w-4 text-slate-500" />
        </div>

        <div className="p-8 md:p-10 space-y-8">

          {/* Detailed Next Steps (Essential Data) */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Sequence of Actions:</h3>
            {content.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:border-black group-hover:text-black transition-all">
                  0{i + 1}
                </div>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-tight italic">{step}</p>
                <ChevronRight className="ml-auto h-4 w-4 text-slate-200 group-hover:text-black transition-colors" />
              </div>
            ))}
          </div>

          {/* Alert Context (Essential Data from Yellow Box) */}
          <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-black space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-black" />
              <span className="text-[10px] font-black uppercase tracking-widest text-black">Inbox Notice</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              A secure link has been dispatched. Please check your **inbox** and **spam** folder to proceed.
            </p>
          </div>

          {/* Role-Specific Detail (Teacher Credentials) */}
          {userRole === UserRole.TEACHER && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex gap-4">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Audit Protocol</p>
                <p className="text-xs text-emerald-800/70 font-medium">Post-verification, our team will review your qualifications. Access will be granted upon approval.</p>
              </div>
            </div>
          )}

          {/* Action Interface */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-black hover:bg-slate-800 text-white rounded-2xl font-black uppercase italic tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              I've Verified My Account
            </Button>

            <Button
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              variant="outline"
              className="w-full h-14 border-2 border-slate-100 rounded-2xl font-black uppercase italic tracking-wider hover:border-black transition-all"
            >
              {isResending ? (
                <RefreshCw className='h-4 w-4 animate-spin' />
              ) : resendCooldown > 0 ? (
                `Retry in ${resendCooldown}s`
              ) : (
                <>
                  <Mail className='h-4 w-4 mr-2' />
                  Resend Link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Footer Navigation & Help */}
      <div className="mt-10 flex flex-col items-center gap-8">
        <button
          onClick={onBackToLogin}
          className="flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black transition-all"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPending;