'use client';

import { Play, Sparkles, Quote, GraduationCap, Award, BookOpen, CheckCircle, TrendingUp, Zap, Flame, Target } from 'lucide-react';
import { TeacherData } from './types';
import { Badge } from '@/components/ui/badge';

interface TeacherOverviewProps {
    teacher: TeacherData;
}

export function TeacherOverview({ teacher }: TeacherOverviewProps) {
    return (
        <div className='space-y-12 max-w-5xl'>

            {/* 1. Bio & Video Section - Compact & Elegant */}
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 items-start'>
                <div className='lg:col-span-6 space-y-6'>
                    <div className='space-y-4'>
                        <h2 className='text-sm font-black uppercase tracking-[0.3em] text-slate-400'>
                            Bio
                        </h2>
                        <p className='text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line'>
                            {teacher.bio}
                        </p>
                    </div>

                    {teacher.teachingApproach && (
                        <div className='p-6 bg-slate-50 rounded-2xl border border-slate-100 italic relative overflow-hidden'>
                            <Quote className='absolute -right-2 -bottom-2 h-24 w-24 text-slate-200/50' />
                            <p className='relative z-10 text-slate-700 font-semibold leading-relaxed'>
                                "{teacher.teachingApproach}"
                            </p>
                        </div>
                    )}
                </div>

                {teacher.videoIntroUrl && (
                    <div className='lg:col-span-5 space-y-4'>
                        <h2 className='text-sm font-black uppercase tracking-[0.3em] text-slate-400'>
                            Introduction
                        </h2>
                        <div className='group relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-slate-200'>
                            <iframe
                                className='absolute inset-0 w-full h-full'
                                src={teacher.videoIntroUrl}
                                title={`${teacher.name} Intro`}
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                allowFullScreen
                            />
                        </div>
                        <div className='flex items-center gap-2 px-3 py-1.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 w-fit'>
                            <div className='h-2 w-2 rounded-full bg-indigo-500 animate-pulse' />
                            <span className='text-[10px] font-bold uppercase tracking-widest text-indigo-600'>Live Video Preview</span>
                        </div>
                    </div>
                )}
            </div>

            <div className='w-full space-y-6'>

                {/* 1. The Main Dashboard Row */}
                <div className='relative w-full bg-slate-950 rounded-xl p-8 md:p-12 text-white overflow-hidden shadow-2xl'>
                    {/* Dynamic Background Accents */}
                    <div className='absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2' />
                    <div className='absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[100px] translate-y-1/2 -translate-x-1/2' />

                    <div className='relative z-10 space-y-10'>

                        {/* Header: Title & Performance Badge */}
                        <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
                            <div className='space-y-2'>
                                <div className='inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md'>
                                    <Flame className='h-3.5 w-3.5 text-emerald-400' />
                                    <span className='text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400'> Credentials</span>
                                </div>
                                <h2 className='text-3xl font-black tracking-tight'>Expertise & Impact</h2>
                            </div>
                            <div className='flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest'>
                                <TrendingUp className='h-4 w-4' />
                                Top 1% Mentor Performance
                            </div>
                        </div>

                        {/* The Grid: 3-Column Layout inside the Dark Component */}
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                            {/* COLUMN 1: Expertise & Tech Stack */}
                            <div className='p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-6 backdrop-blur-sm'>
                                <div className='flex items-center gap-2'>
                                    <Zap className='h-4 w-4 text-emerald-400 fill-emerald-400' />
                                    <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Subject Mastery</h3>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {teacher.subjects.map((subject, i) => (
                                        <Badge key={i} className='bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-3 py-1 rounded-lg text-[11px] font-black border-none transition-colors'>
                                            {subject}
                                        </Badge>
                                    ))}
                                </div>
                                <div className='space-y-2 pt-2'>
                                    <p className='text-[10px] font-bold text-slate-500 uppercase tracking-tighter'>Specialties</p>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {teacher.specialties.map((spec, i) => (
                                            <span key={i} className='text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5'>
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 2: Background & Education */}
                            <div className='p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-6 backdrop-blur-sm'>
                                <div className='flex items-center gap-2'>
                                    <GraduationCap className='h-4 w-4 text-slate-400' />
                                    <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Academic Path</h3>
                                </div>
                                <div className='space-y-4'>
                                    {teacher.education.slice(0, 2).map((edu, i) => (
                                        <div key={i} className='flex items-start gap-3'>
                                            <div className='h-1 w-1 rounded-full bg-emerald-500 mt-2 shrink-0' />
                                            <span className='text-xs font-bold text-slate-200 leading-tight'>{edu}</span>
                                        </div>
                                    ))}
                                    <div className='pt-2'>
                                        {teacher.certifications.slice(0, 1).map((cert, i) => (
                                            <div key={i} className='flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10'>
                                                <Award className='h-4 w-4 text-emerald-400' />
                                                <span className='text-[10px] font-black text-emerald-100 truncate'>{cert}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 3: Social Proof (Success Stories) */}
                            <div className='p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group'>
                                <Quote className='absolute -right-2 -bottom-2 h-16 w-16 text-white/5' />
                                <div className='flex items-center gap-2 mb-4'>
                                    <Sparkles className='h-4 w-4 text-emerald-400' />
                                    <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Latest Result</h3>
                                </div>
                                {teacher.successStories?.[0] && (
                                    <div className='space-y-4 relative z-10'>
                                        <p className='text-xs text-slate-300 italic leading-relaxed font-medium'>
                                            "{teacher.successStories[0].testimonial}"
                                        </p>
                                        <div className='flex items-center gap-3 pt-2'>
                                            <div className='h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 text-xs font-black'>
                                                {teacher.successStories[0].studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className='text-[10px] font-black text-white leading-none'>{teacher.successStories[0].studentName}</p>
                                                <p className='text-[9px] font-bold text-emerald-500 uppercase tracking-tighter mt-1'>{teacher.successStories[0].achievement}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTTOM SECTION: Key Achievements & Strategy */}
                        <div className='pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-12 gap-8'>
                            <div className='md:col-span-5 space-y-4'>
                                <h3 className='text-sm font-black uppercase tracking-[0.3em] text-slate-500'>Strategic Outcomes</h3>
                                <div className='space-y-3'>
                                    {teacher.achievements.slice(0, 3).map((ach, i) => (
                                        <div key={i} className='flex items-center gap-3'>
                                            <CheckCircle className='h-3.5 w-3.5 text-emerald-500' />
                                            <span className='text-xs font-bold text-slate-300'>{ach}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                {teacher.whyChooseMe.slice(0, 4).map((reason, i) => (
                                    <div key={i} className='p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center gap-3 hover:bg-white/[0.05] transition-colors'>
                                        <Target className='h-3.5 w-3.5 text-slate-600' />
                                        <span className='text-[10px] font-bold text-slate-400'>{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Optional Action Footer */}
                        {teacher.sampleLessons?.[0] && (
                            <div className='flex items-center justify-between p-4 bg-emerald-500 text-slate-950 rounded-xl cursor-pointer hover:bg-emerald-400 transition-all'>
                                <div className='flex items-center gap-3'>
                                    <BookOpen className='h-4 w-4' />
                                    <span className='text-xs font-black uppercase tracking-tight'>Preview Featured Lesson: {teacher.sampleLessons[0].title}</span>
                                </div>
                                <div className='px-2 py-0.5 bg-slate-950/10 rounded font-black text-[9px] uppercase'>View PDF</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
