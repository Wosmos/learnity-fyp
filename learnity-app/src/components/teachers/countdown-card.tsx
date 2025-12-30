'use client';

import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours } from 'date-fns';

export function CountdownCard({ targetDate }: { targetDate: string }) {
  const [daysLeft, setDaysLeft] = useState(3);

  useEffect(() => {
    const diff = differenceInDays(new Date(targetDate), new Date());
    setDaysLeft(diff > 0 ? diff : 0);
  }, [targetDate]);

  return (
    <div className="shrink-0 relative">
      <div className="h-24 w-24 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-2xl shadow-slate-200">
        <span className="text-4xl font-bold tracking-tighter">
          {daysLeft}
          <span className="text-base font-normal text-slate-400 ml-0.5">d</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Remaining
        </span>
      </div>
      
      {/* Animated Pulse Ring */}
      <div className="absolute top-0 left-0 h-full w-full rounded-2xl border-2 border-slate-900 opacity-20 animate-ping" />
    </div>
  );
}