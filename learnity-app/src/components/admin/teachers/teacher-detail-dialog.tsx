'use client';

import { useMemo, useState } from 'react';
import {
  Mail,
  Calendar,
  Clock,
  Check,
  X,
  MapPin,
  Phone,
  GraduationCap,
  Award,
  Star,
  BookOpen,
  DollarSign,
  FileText,
  Briefcase,
  ExternalLink,
  ShieldAlert,
  Download,
  User,
  MoreHorizontal,
  Activity,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Teacher } from './columns';

interface TeacherDetailDialogProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherAction?: (teacherId: string, action: string) => void;
}

export function TeacherDetailDialog({
  teacher,
  open,
  onOpenChange,
  onTeacherAction,
}: TeacherDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `${label} copied to clipboard` });
  };

  const stats = useMemo(() => {
    if (!teacher) return [];
    return [
      {
        label: 'Experience',
        value: `${teacher.experience || 0} Years`,
        icon: Briefcase,
      },
      {
        label: 'Rate',
        value: `$${teacher.hourlyRate || 0}/hr`,
        icon: DollarSign,
      },
      { label: 'Sessions', value: teacher.totalSessions || 0, icon: BookOpen },
      { label: 'Rating', value: teacher.rating || 'New', icon: Star },
    ];
  }, [teacher]);

  if (!teacher) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAction = async (action: string) => {
    if (!onTeacherAction) return;
    setLoading(true);
    try {
      await onTeacherAction(teacher.id, action);
      if (action === 'approve' || action === 'reject') {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 
        Fix: h-[90vh] enforces a maximum height within the viewport.
        flex-col ensures the header stays top and body fills the rest.
      */}
      <DialogContent className='max-w-5xl h-[90vh] p-0 gap-0 border-none bg-slate-50 flex flex-col overflow-hidden shadow-2xl'>
        {/* ================= 1. HEADER (Fixed at top) ================= */}
        <div className='shrink-0 relative'>
          {/* Banner Background */}
          <div className='h-32 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden'>
            <div
              className='absolute inset-0 opacity-10'
              style={{
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            ></div>

            {/* Close Button Overlay */}
            <div className='absolute top-4 right-4 z-50'>
              <Button
                variant='secondary'
                size='icon'
                className='bg-black/20 hover:bg-black/40 text-white border-0 backdrop-blur-md rounded-full h-8 w-8'
                onClick={() => onOpenChange(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* ================= 2. SCROLLABLE BODY ================= */}
        {/* 
           Fix: overflow-y-auto enables scrolling for the entire profile content 
           below the banner image.
        */}
        <div className='flex-1 overflow-y-auto'>
          <div className='px-6 md:px-10 pb-10'>
            {/* PROFILE HEADER INFO (Overlaps Banner) */}
            <div className='flex flex-col md:flex-row gap-6 items-start -mt-12 mb-8 relative z-10'>
              {/* Avatar */}
              <div className='shrink-0 relative'>
                <Avatar className='h-28 w-28 ring-4 ring-white shadow-lg bg-white rounded-2xl'>
                  <AvatarImage
                    src={teacher.profilePicture}
                    className='object-cover rounded-2xl'
                  />
                  <AvatarFallback className='rounded-2xl bg-slate-100 text-slate-900 text-2xl font-bold'>
                    {teacher.firstName?.[0]}
                    {teacher.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {/* Status Badge attached to Avatar */}
                <div
                  className={cn(
                    'absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border-2 border-white shadow-sm flex items-center gap-1',
                    teacher.role === 'PENDING_TEACHER'
                      ? 'bg-amber-100 text-amber-700'
                      : teacher.role === 'TEACHER'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                  )}
                >
                  {teacher.role === 'PENDING_TEACHER' ? (
                    <Clock className='h-3 w-3' />
                  ) : teacher.role === 'TEACHER' ? (
                    <Check className='h-3 w-3' />
                  ) : (
                    <ShieldAlert className='h-3 w-3' />
                  )}
                  {teacher.role.replace('_TEACHER', '').toLowerCase()}
                </div>
              </div>

              {/* Name & Contact Info */}
              <div className='mt-14 md:mt-12 flex-1 space-y-2'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-3xl font-bold text-slate-900'>
                    {teacher.firstName} {teacher.lastName}
                  </h2>
                  {/* Mobile Context Menu */}
                  <div className='md:hidden'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-5 w-5' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleCopy(teacher.email, 'Email')}
                        >
                          Copy Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-500'>
                  <div
                    className='flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer'
                    onClick={() => handleCopy(teacher.email, 'Email')}
                  >
                    <Mail className='h-4 w-4' />
                    {teacher.email}
                  </div>
                  {teacher.phone && (
                    <div className='flex items-center gap-1.5'>
                      <Phone className='h-4 w-4' />
                      {teacher.phone}
                    </div>
                  )}
                  {teacher.location && (
                    <div className='flex items-center gap-1.5'>
                      <MapPin className='h-4 w-4' />
                      {teacher.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats (Desktop) */}
              <div className='hidden md:flex gap-8 mt-14 pt-2 border-l border-slate-200 pl-8'>
                {stats.map((stat, i) => (
                  <div key={i} className='space-y-1'>
                    <p className='text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5'>
                      <stat.icon className='h-3.5 w-3.5' /> {stat.label}
                    </p>
                    <p className='text-xl font-bold text-slate-900'>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* MAIN GRID LAYOUT */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* LEFT COLUMN: Deep Dive Info */}
              <div className='lg:col-span-2 space-y-8'>
                {/* Bio Section */}
                <section className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
                  <h3 className='text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2'>
                    <User className='h-4 w-4 text-slate-400' /> Biography
                  </h3>
                  <p className='text-sm leading-7 text-slate-600'>
                    {teacher.bio ||
                      'No biography has been provided by this applicant.'}
                  </p>
                </section>

                {/* Education & Certs */}
                <section className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
                  <h3 className='text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2'>
                    <GraduationCap className='h-4 w-4 text-slate-400' />{' '}
                    Qualifications
                  </h3>

                  <div className='grid sm:grid-cols-2 gap-6'>
                    {/* Education */}
                    <div className='relative pl-4 border-l-2 border-indigo-100'>
                      <h4 className='font-semibold text-slate-900 text-sm mb-1'>
                        Education
                      </h4>
                      <p className='text-sm text-slate-600'>
                        {teacher.education || 'Not specified'}
                      </p>
                    </div>

                    {/* Certifications */}
                    <div className='relative pl-4 border-l-2 border-emerald-100'>
                      <h4 className='font-semibold text-slate-900 text-sm mb-1'>
                        Certifications
                      </h4>
                      {teacher.certifications?.length ? (
                        <ul className='text-sm text-slate-600 space-y-1'>
                          {teacher.certifications.map(c => (
                            <li key={c} className='block'>
                              • {c}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='text-sm text-slate-400'>None listed</p>
                      )}
                    </div>
                  </div>

                  <Separator className='my-6' />

                  {/* Expertise Tags */}
                  <div>
                    <h4 className='font-semibold text-slate-900 text-sm mb-3'>
                      Expertise
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {teacher.expertise?.length ? (
                        teacher.expertise.map(skill => (
                          <Badge
                            key={skill}
                            variant='secondary'
                            className='px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border-0'
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className='text-sm text-slate-400 italic'>
                          No expertise listed
                        </span>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: Action Sidebar */}
              <div className='space-y-6'>
                {/* ADMIN ACTIONS CARD (Sticky Priority) */}
                <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-md ring-1 ring-slate-100'>
                  <div className='mb-4'>
                    <h3 className='font-bold text-slate-900'>
                      Application Action
                    </h3>
                    <p className='text-xs text-slate-500 mt-1'>
                      Manage access for this instructor.
                    </p>
                  </div>

                  {teacher.role === 'PENDING_TEACHER' ? (
                    <div className='space-y-3'>
                      <Button
                        onClick={() => handleAction('approve')}
                        disabled={loading}
                        className='w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-11'
                      >
                        <Check className='mr-2 h-4 w-4' /> Approve Application
                      </Button>
                      <Button
                        onClick={() => handleAction('reject')}
                        disabled={loading}
                        variant='outline'
                        className='w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-11'
                      >
                        <X className='mr-2 h-4 w-4' /> Reject
                      </Button>
                    </div>
                  ) : (
                    <div className='p-3 bg-slate-50 rounded-lg text-center border border-slate-100'>
                      <p className='text-xs text-slate-500'>
                        Status:{' '}
                        <span className='font-bold text-slate-900 uppercase'>
                          {teacher.role.replace('_TEACHER', '')}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-2 mt-3'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full text-slate-600 text-xs border border-slate-100'
                    >
                      <Mail className='mr-2 h-3 w-3' /> Message
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full text-slate-600 text-xs border border-slate-100'
                    >
                      <FileText className='mr-2 h-3 w-3' /> Notes
                    </Button>
                  </div>
                </div>

                {/* Documents */}
                <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
                  <div className='px-5 py-3 border-b border-slate-100 bg-slate-50/50'>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-500'>
                      Supporting Docs
                    </h3>
                  </div>
                  <div className='divide-y divide-slate-50'>
                    <button className='w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-sm text-slate-600 text-left group'>
                      <span className='flex items-center gap-3'>
                        <div className='p-1.5 bg-blue-50 text-blue-600 rounded'>
                          <FileText className='h-4 w-4' />
                        </div>
                        Resume.pdf
                      </span>
                      <Download className='h-4 w-4 text-slate-300 group-hover:text-blue-500' />
                    </button>
                    <button className='w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-sm text-slate-600 text-left group'>
                      <span className='flex items-center gap-3'>
                        <div className='p-1.5 bg-blue-50 text-blue-600 rounded'>
                          <ExternalLink className='h-4 w-4' />
                        </div>
                        LinkedIn Profile
                      </span>
                      <ExternalLink className='h-4 w-4 text-slate-300 group-hover:text-blue-500' />
                    </button>
                  </div>
                </div>

                {/* Metadata Timeline */}
                <div className='px-2'>
                  <div className='flex items-center gap-2 mb-4'>
                    <Activity className='h-4 w-4 text-slate-400' />
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                      Activity Log
                    </h3>
                  </div>

                  <div className='relative pl-4 border-l-2 border-slate-200 space-y-8 ml-2'>
                    <div className='relative'>
                      <div className='absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-300 shadow-sm'></div>
                      <p className='text-xs text-slate-500 font-medium'>
                        Applied
                      </p>
                      <p className='text-xs text-slate-400'>
                        {formatDate(teacher.createdAt)}
                      </p>
                    </div>

                    <div className='relative'>
                      <div
                        className={cn(
                          'absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm',
                          teacher.reviewedAt
                            ? 'bg-indigo-500'
                            : 'bg-white border-slate-300'
                        )}
                      ></div>
                      <p className='text-xs text-slate-500 font-medium'>
                        Review Status
                      </p>
                      {teacher.reviewedAt ? (
                        <div className='mt-0.5'>
                          <p className='text-xs text-slate-900 font-medium'>
                            Reviewed by Admin
                          </p>
                          <p className='text-xs text-slate-400'>
                            {formatDate(teacher.reviewedAt)}
                          </p>
                        </div>
                      ) : (
                        <p className='text-xs text-slate-400 italic'>
                          Pending review...
                        </p>
                      )}
                    </div>

                    <div className='relative'>
                      <div className='absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white bg-white border-slate-300 shadow-sm'></div>
                      <p className='text-xs text-slate-500 font-medium'>
                        Last Login
                      </p>
                      <p className='text-xs text-slate-400'>
                        {teacher.lastLoginAt
                          ? formatDate(teacher.lastLoginAt)
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
