

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type CardVariant = 'glassy' | 'modern' | 'primary' | 'secondary';

interface MetricCardProps {
  title: string;
  value: string | number;
  trendLabel?: string;
  trendValue?: string;
  isTrendUp?: boolean;
  variant?: CardVariant;
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trendLabel,
  trendValue,
  isTrendUp = true,
  variant = 'modern',
  icon: Icon,
  className,
}: MetricCardProps) {

  // Define styles for each variant
  const variants = {
    glassy: "bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-500/5 text-slate-900",
    modern: "bg-white border-none shadow-2xl shadow-slate-200/60 text-slate-900 hover:shadow-indigo-100",
    primary: "bg-indigo-600 text-white shadow-xl shadow-indigo-200 border-none",
    secondary: "bg-slate-900 text-white shadow-xl shadow-slate-900/20 border-none"
  };

  const iconColors = {
    glassy: "bg-indigo-500/10 text-indigo-600",
    modern: "bg-slate-50 text-indigo-600",
    primary: "bg-white/20 text-white",
    secondary: "bg-white/10 text-indigo-400"
  };

  return (
    <div className={cn(
      "relative p-6 rounded-2xl transition-all duration-500 group overflow-hidden",
      variants[variant],
      className
    )}>
      {/* 1. DECORATIVE BACKGROUND NOISE (For that "Glass" texture) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">

        {/* HEADER: Icon & Title */}
        <div className="flex items-center justify-between mb-6">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
            iconColors[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <p className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-right",
            variant === 'primary' || variant === 'secondary' ? "text-white/80" : "text-slate-400"
          )}>
            {title}
          </p>
        </div>

        {/* MAIN CONTENT: Value & Sparkline */}
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-4xl font-black tracking-tighter leading-none">
              {value}
            </h3>

            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                isTrendUp
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              )}>
                {isTrendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trendValue}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight opacity-50",
                variant === 'primary' || variant === 'secondary' ? "text-white" : "text-slate-500"
              )}>
                {trendLabel}
              </span>
            </div>
          </div>

          {/* 2. MINI SPARKLINE GRAPH (Animated SVG) */}
          <div className="w-20 h-10 mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <path
                d={isTrendUp
                  ? "M0 35 Q 25 35, 40 20 T 70 25 T 100 5"
                  : "M0 5 Q 25 5, 40 20 T 70 15 T 100 35"}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className={isTrendUp ? "text-emerald-500" : "text-rose-500"}
              />
              {/* Animated point at end of graph */}
              <circle
                cx="100"
                cy={isTrendUp ? "5" : "35"}
                r="3"
                fill="currentColor"
                className={cn("animate-ping", isTrendUp ? "text-emerald-400" : "text-rose-400")}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. HOVER GLOW EFFECT (Only for Modern/Glassy) */}
      {(variant === 'modern' || variant === 'glassy') && (
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
      )}
    </div>
  );
}