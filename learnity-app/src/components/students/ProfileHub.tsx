'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Sparkles,
  Star,
  Trophy,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Donut Progress ───────────────────────────────────────────
function DonutProgress({
  percentage,
  size = 100,
  stroke = 8,
}: {
  percentage: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className='relative shrink-0' style={{ width: size, height: size }}>
      <svg width={size} height={size} className='rotate-[-90deg]'>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          className='stroke-muted-foreground/10 dark:stroke-muted-foreground/15'
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='url(#donut-grad)'
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id='donut-grad' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor='#6366f1' />
            <stop offset='100%' stopColor='#a855f7' />
          </linearGradient>
        </defs>
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-xl font-black text-foreground leading-none'>
          {percentage}%
        </span>
        <span className='text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5'>
          Complete
        </span>
      </div>
    </div>
  );
}

// ─── Milestone Track ──────────────────────────────────────────
const MILESTONES = [
  { pct: 20, label: 'Basic' },
  { pct: 40, label: 'Groups' },
  { pct: 60, label: 'AI Recs' },
  { pct: 80, label: 'Analytics' },
  { pct: 100, label: 'Premium' },
] as const;

function MilestoneTrack({ percentage }: { percentage: number }) {
  return (
    <div className='flex items-center gap-0 w-full'>
      {MILESTONES.map((m, i) => {
        const unlocked = percentage >= m.pct;
        return (
          <div key={m.pct} className='flex items-center flex-1 last:flex-none'>
            {/* Node */}
            <div className='relative group/node'>
              <div
                className={`h-3 w-3 rounded-full border-2 transition-colors ${
                  unlocked
                    ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-400 dark:border-indigo-400'
                    : 'bg-background border-muted-foreground/25 dark:border-muted-foreground/30'
                }`}
              />
              {/* Tooltip */}
              <span className='absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-muted-foreground whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none'>
                {m.label}
              </span>
            </div>
            {/* Connector line (skip after last) */}
            {i < MILESTONES.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  percentage >= MILESTONES[i + 1].pct
                    ? 'bg-indigo-500 dark:bg-indigo-400'
                    : percentage > m.pct
                      ? 'bg-gradient-to-r from-indigo-500 to-muted-foreground/15 dark:from-indigo-400 dark:to-muted-foreground/20'
                      : 'bg-muted-foreground/15 dark:bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────
interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  studentProfile?: {
    gradeLevel: string;
    subjects: string[];
    learningGoals: string[];
    interests: string[];
    studyPreferences: string[];
    bio?: string;
    profileCompletionPercentage: number;
  };
}

interface CompletionData {
  percentage: number;
  completedSections: { id: string; name: string }[];
  missingSections: { id: string; name: string }[];
  nextSteps: string[];
  rewards: { id: string; name: string }[];
}

interface ProfileHubProps {
  profileData: ProfileData;
  completion: CompletionData;
  onEnhanceClick?: () => void;
}

// ─── Main Component ───────────────────────────────────────────
export function ProfileHub({
  profileData,
  completion,
  onEnhanceClick,
}: ProfileHubProps) {
  const initials =
    `${profileData.firstName?.[0] ?? ''}${profileData.lastName?.[0] ?? ''}`.toUpperCase() ||
    'ST';
  const fullName =
    `${profileData.firstName} ${profileData.lastName}`.trim() || 'Student';
  const isComplete = completion.percentage >= 100;

  // Next milestone
  const nextMilestone = MILESTONES.find(m => m.pct > completion.percentage);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='group'
    >
      <div className='relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
        {/* Subtle gradient accent along top edge */}
        <div className='absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' />

        <div className='p-5 sm:p-6 lg:p-8'>
          {/* ═══════ DESKTOP (lg+) ═══════ */}
          <div className='hidden lg:flex items-start gap-8'>
            {/* Left: Identity */}
            <div className='flex items-start gap-5 min-w-0 flex-1'>
              {/* Avatar */}
              <div className='relative shrink-0'>
                <Avatar className='h-[72px] w-[72px] ring-2 ring-border shadow-md'>
                  <AvatarImage
                    src={profileData.profilePicture}
                    className='object-cover'
                  />
                  <AvatarFallback className='bg-slate-900 dark:bg-slate-700 text-white font-bold text-lg'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {profileData.emailVerified && (
                  <div className='absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-indigo-600 border-2 border-card flex items-center justify-center'>
                    <ShieldCheck className='h-3 w-3 text-white' />
                  </div>
                )}
              </div>

              {/* Name + Meta */}
              <div className='min-w-0 space-y-1.5'>
                <h2 className='text-xl font-black text-foreground tracking-tight truncate'>
                  {fullName}
                </h2>
                <p className='text-sm text-muted-foreground flex items-center gap-1.5 truncate'>
                  <Mail className='h-3.5 w-3.5 text-indigo-500 shrink-0' />
                  {profileData.email}
                </p>
                <div className='flex items-center gap-2 pt-0.5'>
                  <div className='flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full'>
                    <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
                    <span className='text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest'>
                      Online
                    </span>
                  </div>
                  <Badge
                    variant='outline'
                    className='text-[9px] font-bold uppercase tracking-widest border-border text-muted-foreground'
                  >
                    {profileData.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Center: Donut */}
            <div className='shrink-0'>
              <DonutProgress percentage={completion.percentage} size={100} />
            </div>

            {/* Right: Next Steps + CTA */}
            <div className='min-w-0 w-[240px] shrink-0 space-y-4'>
              {!isComplete && completion.nextSteps.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                    Next Steps
                  </p>
                  <ul className='space-y-1.5'>
                    {completion.nextSteps.slice(0, 4).map((step, i) => (
                      <li
                        key={i}
                        className='flex items-center gap-2 text-xs text-muted-foreground'
                      >
                        <ArrowRight className='h-3 w-3 text-indigo-500 shrink-0' />
                        <span className='truncate'>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {isComplete && (
                <div className='flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                  <Trophy className='h-4 w-4' />
                  All features unlocked!
                </div>
              )}
              {!isComplete && onEnhanceClick && (
                <Button
                  onClick={onEnhanceClick}
                  size='sm'
                  className='w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-9'
                >
                  Enhance Profile
                  <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                </Button>
              )}
            </div>
          </div>

          {/* ═══════ MOBILE (< lg) ═══════ */}
          <div className='flex flex-col lg:hidden'>
            {/* Top: Status bar */}
            <div className='flex items-center justify-between mb-5'>
              <div className='flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
                <span className='text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest'>
                  Online
                </span>
              </div>
              <Badge
                variant='outline'
                className='text-[9px] font-bold uppercase tracking-widest border-border text-muted-foreground'
              >
                {profileData.role}
              </Badge>
            </div>

            {/* Identity row */}
            <div className='flex items-center gap-4 mb-6'>
              <div className='relative shrink-0'>
                <Avatar className='h-14 w-14 ring-2 ring-border shadow-md'>
                  <AvatarImage
                    src={profileData.profilePicture}
                    className='object-cover'
                  />
                  <AvatarFallback className='bg-slate-900 dark:bg-slate-700 text-white font-bold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {profileData.emailVerified && (
                  <div className='absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-indigo-600 border-2 border-card flex items-center justify-center'>
                    <ShieldCheck className='h-2.5 w-2.5 text-white' />
                  </div>
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <h2 className='text-lg font-black text-foreground tracking-tight truncate'>
                  {fullName}
                </h2>
                <p className='text-xs text-muted-foreground truncate'>
                  {profileData.email}
                </p>
              </div>
            </div>

            {/* Donut + Steps side by side */}
            <div className='flex items-start gap-5 mb-6'>
              <DonutProgress percentage={completion.percentage} size={88} stroke={7} />
              {!isComplete && completion.nextSteps.length > 0 && (
                <div className='flex-1 min-w-0 space-y-2'>
                  <p className='text-[9px] font-bold text-muted-foreground uppercase tracking-widest'>
                    Next Steps
                  </p>
                  <ul className='space-y-1.5'>
                    {completion.nextSteps.slice(0, 4).map((step, i) => (
                      <li
                        key={i}
                        className='flex items-center gap-1.5 text-xs text-muted-foreground'
                      >
                        <ArrowRight className='h-2.5 w-2.5 text-indigo-500 shrink-0' />
                        <span className='truncate'>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {isComplete && (
                <div className='flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                  <Trophy className='h-4 w-4' />
                  All features unlocked!
                </div>
              )}
            </div>

            {/* CTA */}
            {!isComplete && onEnhanceClick && (
              <Button
                onClick={onEnhanceClick}
                size='sm'
                className='w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-9'
              >
                Enhance Profile
                <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
              </Button>
            )}
          </div>

          {/* ═══════ Milestone Track (both layouts) ═══════ */}
          <div className='mt-5 pt-5 border-t border-border'>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <MilestoneTrack percentage={completion.percentage} />
                {/* Labels under first and last node */}
                <div className='flex justify-between mt-1.5 px-0.5'>
                  <span className='text-[8px] font-semibold text-muted-foreground/60 uppercase'>
                    Basic
                  </span>
                  <span className='text-[8px] font-semibold text-muted-foreground/60 uppercase'>
                    Premium
                  </span>
                </div>
              </div>
              {nextMilestone && (
                <div className='hidden sm:block shrink-0 text-right'>
                  <p className='text-[9px] font-bold text-muted-foreground uppercase tracking-wider'>
                    Next unlock
                  </p>
                  <p className='text-xs font-semibold text-foreground'>
                    {nextMilestone.label}{' '}
                    <span className='text-muted-foreground font-normal'>
                      ({nextMilestone.pct - completion.percentage}% away)
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
