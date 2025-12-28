'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EliteStreakCard() {
    // 35 days (5 weeks) to show a proper GitHub-style transition
    const activity = Array.from({ length: 35 }, (_, i) => ({
        active: i > 28,
        level: i > 28 ? 4 : Math.floor(Math.random() * 3),
    }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden h-full bg-slate-950 rounded-2xl p-5 shadow-2xl border border-white/5"
        >
            {/* Subtle Glow Overlays */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/10 blur-[60px] pointer-events-none" />

            <div className="flex flex-col gap-5">

                {/* TOP ROW: Identity & Pulse */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute inset-0 bg-orange-500 rounded-full blur-md"
                            />
                            <div className="relative bg-slate-900 p-2 rounded-xl border border-white/10">
                                <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white leading-none tracking-tight">Focus Momentum</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Status: Elite</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="text-3xl font-black text-white tracking-tighter">7</span>
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Day Streak</span>
                        </div>
                    </div>
                </div>

                {/* MIDDLE ROW: The Precision Matrix (GitHub Style) */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-slate-600">
                        <span>Recent Activity</span>
                        <div className="flex gap-1 items-center">
                            <span>Less</span>
                            {[0, 1, 2, 3, 4].map((lvl) => (
                                <div key={lvl} className={cn("h-1.5 w-1.5 rounded-[1px]", getLevelColor(lvl))} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>

                    <div className="flex gap-[3px] flex-1">
                        <div className="grid grid-rows-7 gap-[3px] text-[8px] font-black text-slate-700 uppercase leading-[10px] pt-[2px]">
                            <span className="h-[10px]">Mon</span>
                            <span className="h-[10px]" />
                            <span className="h-[10px]">Wed</span>
                            <span className="h-[10px]" />
                            <span className="h-[10px]">Fri</span>
                            <span className="h-[10px]" />
                            <span className="h-[10px]" />
                        </div>
                        {/* Grouping into weeks */}
                        {Array.from({ length: 5 }).map((_, weekIndex) => (
                            <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                                {activity.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.5, zIndex: 20 }}
                                        className={cn(
                                            "h-[10px] w-[10px] rounded-[2px] transition-colors duration-300",
                                            getLevelColor(day.level)
                                        )}
                                    />
                                ))}
                            </div>
                        ))}
                        <div className=" ml-4 self-center space-y-2 flex-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-white/40 uppercase italic">Next Milestone</span>
                                <span className="text-[10px] font-black text-white">10D</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '70%' }}
                                    className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                                />
                            </div>
                            {/* BOTTOM ROW: Compact Stats */}
                            <div className="flex flex-col gap-2">
                                <div className="bg-white/[0.03] border border-white/[0.05] p-1 rounded-md flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">94% Consistency</span>
                                </div>
                                <div className="bg-white/[0.03] border border-white/[0.05] p-1 rounded-md flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Active Now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </motion.div>
    );
}

function getLevelColor(level: number) {
    switch (level) {
        case 0: return "bg-white/[0.05]";
        case 1: return "bg-orange-500/20";
        case 2: return "bg-orange-500/40";
        case 3: return "bg-orange-500/70";
        case 4: return "bg-orange-500";
        default: return "bg-white/[0.05]";
    }
}