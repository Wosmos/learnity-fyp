'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  trendLabel: string;
  trendValue: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: string;
  bgColor?: string;
  textColor?: string;
  trendColor?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trendLabel,
  trendValue,
  icon: Icon,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-100',
  textColor = 'text-slate-900',
  trendColor = 'text-emerald-600',
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("glass-card border-white/50 min-h-[120px] sm:min-h-[128px]", className)}>
      <CardContent className="p-3 sm:p-2 h-full">
        <div className="flex items-start justify-between h-full gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium mb-1 truncate">{title}</p>
            <p className={cn("text-2xl sm:text-3xl lg:text-4xl font-bold break-words", textColor)}>{value}</p>
            <p className={cn("text-xs sm:text-sm font-medium mt-1 sm:mt-2 flex items-center gap-1 flex-wrap", trendColor)}>
              <span className="whitespace-nowrap">{trendValue}</span>
              <span className="text-slate-500">{trendLabel}</span>
            </p>
          </div>
          {Icon && (
            <div className={cn("p-2 sm:p-2.5 md:p-3 rounded-lg flex-shrink-0 backdrop-blur-sm shadow-sm", bgColor)}>
              <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}