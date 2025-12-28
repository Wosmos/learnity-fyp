'use client';

import React from 'react'
import { Card, CardContent } from '../ui/card'
import Link from 'next/link'
import {
    BookOpen, Calendar, GraduationCap,
    Users, ChevronRight, ArrowRight, Trophy,
    Star, Target, Zap, ShieldCheck, LayoutGrid
} from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { EliteStreakCard } from './StreaksCard';
import { Progress } from '../ui/progress'
import { motion } from 'framer-motion';
import HighLights from './HighLights';

function SideBar() {
    return (
        <div className="space-y-10">
            {/* 1. STUDY STREAK - THE PRIMARY HOOK */}
            <EliteStreakCard />

            {/* 2. OPERATIONAL COMMAND CENTER */}
            <section>
                <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-[#0F172A] text-white overflow-hidden rounded-2xl">
                    <CardContent className="p-3 space-y-2">
                        {[
                            { href: "/courses", label: "Browse Catalog", icon: BookOpen, sub: "Explore new domains", color: "text-blue-400" },
                            { href: "/dashboard/student/courses", label: "My Curriculum", icon: GraduationCap, sub: "84% Completion", color: "text-indigo-400" },
                            { href: "#", label: "Consultations", icon: Calendar, sub: "Book an expert", color: "text-orange-400" },
                        ].map((item, i) => (
                            <Link key={i} href={item.href} className="block group">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <item.icon className={cn("h-5 w-5", item.color)} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black tracking-tight">{item.label}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </section>

            {/* 3. ACHIEVEMENTS - DIGITAL TROPHY CASE */}
            <section >

                <HighLights />
            </section>
        </div>
    )
}

export default SideBar