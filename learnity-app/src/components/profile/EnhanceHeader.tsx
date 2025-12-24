import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhanceHeaderProps {
  firstName?: string;
  completionPercentage?: number;
  onBack: () => void;
}

export function EnhanceHeader({ firstName, completionPercentage = 0, onBack }: EnhanceHeaderProps) {
  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Brand & Identity Section */}
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-all active:scale-95 border border-transparent hover:border-slate-200"
            >
              <ArrowLeft className="h-5 w-5 text-slate-900" />
            </Button>
            
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" /> {/* Divider */}

            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-slate-900 leading-none">
                Profile <span className="text-indigo-600 italic">Matrix</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                Operator // <span className="text-slate-600">{firstName || 'Guest'}</span>
              </p>
            </div>
          </div>

          {/* Tactical Completion HUD */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden xs:flex">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Sync Status
              </span>
              <span className="text-sm font-black text-slate-900 italic tabular-nums">
                {completionPercentage}%
              </span>
            </div>
            
            {/* Minimalist Progress Ring/Bar */}
            <div className="relative h-10 w-10 flex items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="20"
                  cy="20"
                  r="18"
                  className="stroke-indigo-600 fill-none"
                  strokeWidth="3"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - completionPercentage }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <LayoutGrid className="absolute h-3 w-3 text-slate-400" />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}