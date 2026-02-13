'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Mail,
  ShieldCheck,
  Terminal,
  Activity,
  Fingerprint,
  ArrowUpRight,
  Edit3,
  Globe,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function EliteProfileCard({ profileData }: { profileData: any }) {
  const initials =
    profileData?.name
      ?.split(' ')
      .map((n: any) => n[0])
      .join('') || 'ST';
  const lastLogin = profileData?.lastLoginAt
    ? new Date(profileData.lastLoginAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <section className='relative mb-6 lg:mb-10 group lg:px-0'>
      {/* ================= MOBILE VIEW (Minimal Card) ================= */}
      <div className='block lg:hidden'>
        <div className='relative bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 overflow-hidden'>
          {/* Background Decoration */}
          <div className='absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent'></div>

          <div className='relative flex flex-col items-center'>
            {/* Header Status */}
            <div className='w-full flex justify-between items-start mb-6'>
              <div className='flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100/50'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
                <span className='text-[9px] font-black text-emerald-600 uppercase tracking-widest'>
                  Online
                </span>
              </div>
              <Badge
                variant='outline'
                className='border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white'
              >
                {profileData?.role || 'STUDENT'}
              </Badge>
            </div>

            {/* Avatar & Identity */}
            <div className='relative mb-4'>
              <Avatar className='h-24 w-24 ring-4 ring-white shadow-xl'>
                <AvatarImage
                  src={profileData?.profilePicture}
                  className='object-cover'
                />
                <AvatarFallback className='bg-slate-900 text-white font-bold'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='absolute -bottom-1 -right-1 bg-indigo-600 border-[3px] border-white h-7 w-7 rounded-full flex items-center justify-center shadow-md'>
                <ShieldCheck className='h-3 w-3 text-white' />
              </div>
            </div>

            <h2 className='text-2xl font-black text-slate-900 tracking-tight text-center'>
              {profileData?.name}
            </h2>
            <p className='text-xs font-medium text-slate-400 text-center mb-6'>
              {profileData?.email}
            </p>

            {/* Quick Stats Grid */}
            <div className='w-full grid grid-cols-2 gap-3 mb-6'>
              <div className='bg-slate-50 p-3 rounded-xl border border-slate-100 text-center'>
                <p className='text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1'>
                  Login
                </p>
                <p className='text-xs font-bold text-slate-900'>{lastLogin}</p>
              </div>
              <div className='bg-slate-50 p-3 rounded-xl border border-slate-100 text-center'>
                <p className='text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1'>
                  Auth
                </p>
                <p className='text-xs font-bold text-slate-900 uppercase truncate px-1'>
                  {profileData?.firebase?.sign_in_provider || 'Google'}
                </p>
              </div>
            </div>

            {/* Saturation Bar */}
            <div className='w-full space-y-2'>
              <div className='flex justify-between items-end'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>
                  Profile Saturation
                </span>
                <span className='text-sm font-black text-indigo-600'>
                  {profileData?.profileComplete ? '100%' : '65%'}
                </span>
              </div>
              <div className='h-1.5 w-full bg-slate-100 rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: profileData?.profileComplete ? '100%' : '65%',
                  }}
                  className='h-full bg-indigo-600 rounded-full'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP VIEW (Original Design) ================= */}
      <div className='hidden lg:block relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50'>
        <div className='absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 pointer-events-none' />

        <div className='relative flex flex-col lg:flex-row min-h-[380px]'>
          {/* LEFT: Identity Hub */}
          <div className='lg:w-[380px] bg-slate-50/80 border-r border-slate-100 p-10 flex flex-col items-center justify-between'>
            <div className='w-full flex justify-between items-center mb-4'>
              <div className='flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100'>
                <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                <span className='text-[10px] font-black text-emerald-600 uppercase tracking-widest'>
                  Live Session
                </span>
              </div>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
                ID: {profileData?.profileId?.slice(-6)}
              </p>
            </div>

            <div className='relative mb-6'>
              <div className='absolute -inset-4 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity' />
              <Avatar className='h-32 w-32 ring-4 ring-white shadow-2xl relative z-10'>
                <AvatarImage src={profileData?.profilePicture} />
                <AvatarFallback className='text-3xl bg-slate-900 text-white font-black'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className='absolute -bottom-1 -right-1 bg-indigo-600 border-4 border-white h-9 w-9 rounded-full flex items-center justify-center z-20 shadow-lg'
              >
                <ShieldCheck className='h-4 w-4 text-white' />
              </motion.div>
            </div>

            <div className='text-center space-y-1 mb-8'>
              <h2 className='text-3xl font-black text-slate-900 tracking-tighter leading-none'>
                {profileData?.name}
              </h2>
              <p className='text-sm font-bold text-slate-400 flex items-center justify-center gap-1'>
                <Mail className='h-3.5 w-3.5 text-indigo-500' />{' '}
                {profileData?.email}
              </p>
            </div>

            <Button className='w-full h-12 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-slate-200 group/btn'>
              Modify Protocol{' '}
              <Edit3 className='ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform' />
            </Button>
          </div>

          {/* RIGHT: System Readout */}
          <div className='flex-1 p-10 flex flex-col justify-between'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
              {/* Real-time Metadata */}
              <div className='space-y-6'>
                <div className='flex items-center gap-2'>
                  <Activity className='h-4 w-4 text-purple-600' />
                  <h4 className='text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]'>
                    System Status
                  </h4>
                </div>

                <div className='space-y-5'>
                  <div className='flex items-start gap-4'>
                    <div className='h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0'>
                      <Globe className='h-5 w-5 text-indigo-600' />
                    </div>
                    <div>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        Login Instance
                      </p>
                      <p className='text-sm font-bold text-slate-900'>
                        {lastLogin}{' '}
                        <span className='text-slate-300 font-medium ml-1'>
                          Today
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0'>
                      <Fingerprint className='h-5 w-5 text-purple-600' />
                    </div>
                    <div>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        AuthProvider
                      </p>
                      <p className='text-sm font-bold text-slate-900 uppercase'>
                        {profileData?.firebase?.sign_in_provider ||
                          'Google Auth'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LOWER TELEMETRY: Profile Completion Bar */}
            <div className='mt-12 pt-8 border-t border-slate-100'>
              <div className='flex items-center gap-8'>
                <div className='flex-1'>
                  <div className='flex justify-between items-end mb-3'>
                    <div className='flex items-center gap-2'>
                      <span className='px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded uppercase'>
                        Academic Node
                      </span>
                      <p className='text-[11px] font-black text-slate-900 uppercase tracking-widest'>
                        Profile Saturation
                      </p>
                    </div>
                    <span className='text-xl font-black text-slate-900'>
                      {profileData?.profileComplete ? '100%' : '65%'}
                    </span>
                  </div>
                  <div className='h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: profileData?.profileComplete ? '100%' : '65%',
                      }}
                      className='absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient-x rounded-full'
                    />
                  </div>
                </div>

                <div className='hidden sm:flex flex-col items-end'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                    Account Role
                  </p>
                  <Badge className='bg-slate-900 text-white hover:bg-slate-900 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border-none'>
                    {profileData?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
